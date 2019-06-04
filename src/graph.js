import {
  has,
  constant,
  isFunction,
  keys,
  filter,
  isEmpty,
  each,
  isUndefined,
  union,
  reduce
} from "lodash";
const DEFAULT_EDGE_NAME = "\x00";
const GRAPH_NODE = "\x00";
const EDGE_KEY_DELIM = "\x01";

const values = Object.values;
// Implementation notes:
//
//  * Node id query functions should return string ids for the nodes
//  * Edge id query functions should return an "edgeObj", edge object, that is
//    composed of enough information to uniquely identify an edge: {v, w, name}.
//  * Internally we use an "edgeId", a stringified form of the edgeObj, to
//    reference edges. This is because we need a performant way to look these
//    edges up and, object properties, which have string keys, are the closest
//    we're going to get to a performant hashtable in JavaScript.

class Graph {
  constructor(opts) {
    this._isDirected = has(opts, "directed") ? opts.directed : true;
    this._isMultigraph = has(opts, "multigraph") ? opts.multigraph : false;
    this._isCompound = has(opts, "compound") ? opts.compound : false;

    // Label for the graph itself
    this._label = undefined;

    // Defaults to be set when creating a new node
    this._defaultNodeLabelFn = constant(undefined);

    // Defaults to be set when creating a new edge
    this._defaultEdgeLabelFn = constant(undefined);

    // v -> label
    this._nodes = {};

    if (this._isCompound) {
      // v -> parent
      this._parent = {};

      // v -> children
      this._children = {};
      this._children[GRAPH_NODE] = {};
    }

    // v -> edgeObj
    this._in = {};

    // u -> v -> Number
    this._preds = {};

    // v -> edgeObj
    this._out = {};

    // v -> w -> Number
    this._sucs = {};

    // e -> edgeObj
    this._edgeObjs = {};

    // e -> label
    this._edgeLabels = {};
  }

  /* === Graph functions ========= */

  isDirected() {
    return this._isDirected;
  }

  isMultigraph() {
    return this._isMultigraph;
  }

  isCompound() {
    return this._isCompound;
  }

  setGraph(label) {
    this._label = label;
    return this;
  }

  graph() {
    return this._label;
  }

  /* === Node functions ========== */

  setDefaultNodeLabel(newDefault) {
    if (!isFunction(newDefault)) {
      newDefault = constant(newDefault);
    }
    this._defaultNodeLabelFn = newDefault;
    return this;
  }

  nodeCount() {
    return this._nodeCount;
  }

  nodes() {
    return keys(this._nodes);
  }

  sources() {
    const self = this;
    return filter(this.nodes(), (v) => isEmpty(self._in[v]));
  }

  sinks() {
    const self = this;
    return filter(this.nodes(), (v) => isEmpty(self._out[v]));
  }

  setNodes(vs, value) {
    const args = arguments;
    const self = this;
    each(vs, (v) => {
      if (args.length > 1) {
        self.setNode(v, value);
      } else {
        self.setNode(v);
      }
    });
    return this;
  }

  setNode(v, value) {
    if (has(this._nodes, v)) {
      if (arguments.length > 1) {
        this._nodes[v] = value;
      }
      return this;
    }

    this._nodes[v] = arguments.length > 1 ? value : this._defaultNodeLabelFn(v);
    if (this._isCompound) {
      this._parent[v] = GRAPH_NODE;
      this._children[v] = {};
      this._children[GRAPH_NODE][v] = true;
    }
    this._in[v] = {};
    this._preds[v] = {};
    this._out[v] = {};
    this._sucs[v] = {};
    ++this._nodeCount;
    return this;
  }

  node(v) {
    return this._nodes[v];
  }

  hasNode(v) {
    return has(this._nodes, v);
  }

  removeNode(v) {
    const self = this;
    if (has(this._nodes, v)) {
      const removeEdge = (e) => {
        self.removeEdge(self._edgeObjs[e]);
      };
      delete this._nodes[v];
      if (this._isCompound) {
        this._removeFromParentsChildList(v);
        delete this._parent[v];
        each(this.children(v), (child) => {
          self.setParent(child);
        });
        delete this._children[v];
      }
      each(keys(this._in[v]), removeEdge);
      delete this._in[v];
      delete this._preds[v];
      each(keys(this._out[v]), removeEdge);
      delete this._out[v];
      delete this._sucs[v];
      --this._nodeCount;
    }
    return this;
  }

  setParent(v, parent) {
    if (!this._isCompound) {
      throw new Error("Cannot set parent in a non-compound graph");
    }

    if (isUndefined(parent)) {
      parent = GRAPH_NODE;
    } else {
      // Coerce parent to string
      parent += "";
      for (
        let ancestor = parent;
        !isUndefined(ancestor);
        ancestor = this.parent(ancestor)
      ) {
        if (ancestor === v) {
          throw new Error(
            `Setting ${parent} as parent of ${v} would create a cycle`
          );
        }
      }

      this.setNode(parent);
    }

    this.setNode(v);
    this._removeFromParentsChildList(v);
    this._parent[v] = parent;
    this._children[parent][v] = true;
    return this;
  }

  _removeFromParentsChildList(v) {
    delete this._children[this._parent[v]][v];
  }

  parent(v) {
    if (this._isCompound) {
      const parent = this._parent[v];
      if (parent !== GRAPH_NODE) {
        return parent;
      }
    }
  }

  children(v) {
    if (isUndefined(v)) {
      v = GRAPH_NODE;
    }

    if (this._isCompound) {
      const children = this._children[v];
      if (children) {
        return keys(children);
      }
    } else if (v === GRAPH_NODE) {
      return this.nodes();
    } else if (this.hasNode(v)) {
      return [];
    }
  }

  predecessors(v) {
    const predsV = this._preds[v];
    if (predsV) {
      return keys(predsV);
    }
  }

  successors(v) {
    const sucsV = this._sucs[v];
    if (sucsV) {
      return keys(sucsV);
    }
  }

  neighbors(v) {
    const preds = this.predecessors(v);
    if (preds) {
      return union(preds, this.successors(v));
    }
  }

  isLeaf(v) {
    let neighbors;
    if (this.isDirected()) {
      neighbors = this.successors(v);
    } else {
      neighbors = this.neighbors(v);
    }
    return neighbors.length === 0;
  }

  filterNodes(filter) {
    const copy = new this.constructor({
      directed: this._isDirected,
      multigraph: this._isMultigraph,
      compound: this._isCompound
    });

    copy.setGraph(this.graph());

    const self = this;
    each(this._nodes, (value, v) => {
      if (filter(v)) {
        copy.setNode(v, value);
      }
    });

    each(this._edgeObjs, (e) => {
      if (copy.hasNode(e.v) && copy.hasNode(e.w)) {
        copy.setEdge(e, self.edge(e));
      }
    });

    const parents = {};
    function findParent(v) {
      const parent = self.parent(v);
      if (parent === undefined || copy.hasNode(parent)) {
        parents[v] = parent;
        return parent;
      } else if (parent in parents) {
        return parents[parent];
      } else {
        return findParent(parent);
      }
    }

    if (this._isCompound) {
      each(copy.nodes(), (v) => {
        copy.setParent(v, findParent(v));
      });
    }

    return copy;
  }

  /* === Edge functions ========== */

  setDefaultEdgeLabel(newDefault) {
    if (!isFunction(newDefault)) {
      newDefault = constant(newDefault);
    }
    this._defaultEdgeLabelFn = newDefault;
    return this;
  }

  edgeCount() {
    return this._edgeCount;
  }

  edges() {
    return values(this._edgeObjs);
  }

  setPath(vs, value) {
    const self = this;
    const args = arguments;
    reduce(vs, (v, w) => {
      if (args.length > 1) {
        self.setEdge(v, w, value);
      } else {
        self.setEdge(v, w);
      }
      return w;
    });
    return this;
  }

  /*
   * setEdge(v, w, [value, [name]])
   * setEdge({ v, w, [name] }, [value])
   */
  setEdge(...args) {
    let v;
    let w;
    let name;
    let value;
    let valueSpecified = false;
    const arg0 = args[0];

    if (typeof arg0 === "object" && arg0 !== null && "v" in arg0) {
      v = arg0.v;
      w = arg0.w;
      name = arg0.name;
      if (args.length === 2) {
        value = args[1];
        valueSpecified = true;
      }
    } else {
      v = arg0;
      w = args[1];
      name = args[3];
      if (args.length > 2) {
        value = args[2];
        valueSpecified = true;
      }
    }

    v = `${v}`;
    w = `${w}`;
    if (!isUndefined(name)) {
      name = `${name}`;
    }

    const e = edgeArgsToId(this._isDirected, v, w, name);
    if (has(this._edgeLabels, e)) {
      if (valueSpecified) {
        this._edgeLabels[e] = value;
      }
      return this;
    }

    if (!isUndefined(name) && !this._isMultigraph) {
      throw new Error("Cannot set a named edge when isMultigraph = false");
    }

    // It didn't exist, so we need to create it.
    // First ensure the nodes exist.
    this.setNode(v);
    this.setNode(w);

    this._edgeLabels[e] = valueSpecified
      ? value
      : this._defaultEdgeLabelFn(v, w, name);

    const edgeObj = edgeArgsToObj(this._isDirected, v, w, name);
    // Ensure we add undirected edges in a consistent way.
    v = edgeObj.v;
    w = edgeObj.w;

    Object.freeze(edgeObj);
    this._edgeObjs[e] = edgeObj;
    incrementOrInitEntry(this._preds[w], v);
    incrementOrInitEntry(this._sucs[v], w);
    this._in[w][e] = edgeObj;
    this._out[v][e] = edgeObj;
    this._edgeCount++;
    return this;
  }

  edge(v, w, name) {
    const e =
      arguments.length === 1
        ? edgeObjToId(this._isDirected, arguments[0])
        : edgeArgsToId(this._isDirected, v, w, name);
    return this._edgeLabels[e];
  }

  hasEdge(v, w, name) {
    const e =
      arguments.length === 1
        ? edgeObjToId(this._isDirected, arguments[0])
        : edgeArgsToId(this._isDirected, v, w, name);
    return has(this._edgeLabels, e);
  }

  removeEdge(v, w, name) {
    const e =
      arguments.length === 1
        ? edgeObjToId(this._isDirected, arguments[0])
        : edgeArgsToId(this._isDirected, v, w, name);
    const edge = this._edgeObjs[e];
    if (edge) {
      v = edge.v;
      w = edge.w;
      delete this._edgeLabels[e];
      delete this._edgeObjs[e];
      decrementOrRemoveEntry(this._preds[w], v);
      decrementOrRemoveEntry(this._sucs[v], w);
      delete this._in[w][e];
      delete this._out[v][e];
      this._edgeCount--;
    }
    return this;
  }

  inEdges(v, u) {
    const inV = this._in[v];
    if (inV) {
      const edges = values(inV);
      if (!u) {
        return edges;
      }
      return filter(edges, (edge) => edge.v === u);
    }
  }

  outEdges(v, w) {
    const outV = this._out[v];
    if (outV) {
      const edges = values(outV);
      if (!w) {
        return edges;
      }
      return filter(edges, (edge) => edge.w === w);
    }
  }

  nodeEdges(v, w) {
    const inEdges = this.inEdges(v, w);
    if (inEdges) {
      return inEdges.concat(this.outEdges(v, w));
    }
  }
}

/* Number of nodes in the graph. Should only be changed by the implementation. */
Graph.prototype._nodeCount = 0;

/* Number of edges in the graph. Should only be changed by the implementation. */
Graph.prototype._edgeCount = 0;

function incrementOrInitEntry(map, k) {
  if (map[k]) {
    map[k]++;
  } else {
    map[k] = 1;
  }
}

function decrementOrRemoveEntry(map, k) {
  if (!--map[k]) {
    delete map[k];
  }
}

function edgeArgsToId(isDirected, v_, w_, name) {
  let v = `${v_}`;
  let w = `${w_}`;
  if (!isDirected && v > w) {
    const tmp = v;
    v = w;
    w = tmp;
  }
  return (
    v +
    EDGE_KEY_DELIM +
    w +
    EDGE_KEY_DELIM +
    (isUndefined(name) ? DEFAULT_EDGE_NAME : name)
  );
}

function edgeArgsToObj(isDirected, v_, w_, name) {
  let v = `${v_}`;
  let w = `${w_}`;
  if (!isDirected && v > w) {
    const tmp = v;
    v = w;
    w = tmp;
  }
  const edgeObj = { v, w };
  if (name) {
    edgeObj.name = name;
  }
  return edgeObj;
}

function edgeObjToId(isDirected, { v, w, name }) {
  return edgeArgsToId(isDirected, v, w, name);
}
export { Graph };
