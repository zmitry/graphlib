import { Graph } from "./graph";

export function write(g) {
  var json = {
    options: {
      directed: g.isDirected(),
      multigraph: g.isMultigraph(),
      compound: g.isCompound()
    },
    nodes: writeNodes(g),
    edges: writeEdges(g)
  };
  if (g.graph() !== undefined) {
    json.value = _.clone(g.graph());
  }
  return json;
}

function writeNodes(g) {
  return g.nodes().map(function(v) {
    var nodeValue = g.node(v);
    var parent = g.parent(v);
    var node = { v: v };
    if (nodeValue !== undefined) {
      node.value = nodeValue;
    }
    if (!parent !== undefined) {
      node.parent = parent;
    }
    return node;
  });
}

function writeEdges(g) {
  return (g.edges() || []).map(function(e) {
    var edgeValue = g.edge(e);
    var edge = { v: e.v, w: e.w };
    if (e.name !== undefined) {
      edge.name = e.name;
    }
    if (edgeValue !== undefined) {
      edge.value = edgeValue;
    }
    return edge;
  });
}

export function read(json) {
  var g = new Graph(json.options).setGraph(json.value);
  for (let entry of json.nodes) {
    g.setNode(entry.v, entry.value);
    if (entry.parent) {
      g.setParent(entry.v, entry.parent);
    }
  }
  for (let entry of json.edges) {
    g.setEdge({ v: entry.v, w: entry.w, name: entry.name }, entry.value);
  }
  return g;
}
