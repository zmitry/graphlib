# graphslib

**Table of Contents**

- [Graph Concepts](#graph-concepts)
  - [Node and Edge Representation](#node-and-edge-representation)
  - [Multigraphs](#multigraphs)
  - [Compound Graphs](#compound-graphs)
  - [Default Labels](#default-labels)
- [Graph API](#graph-api)
- [Serialization](#serialization)
  - [json.read](#json-read)
  - [json.write](#json-write)
- [Algorithms](#algorithms)
  - [alg.components](#alg-components)
  - [alg.dijkstra](#alg-dijkstra)
  - [alg.dijkstraAll](#alg-dijkstra-all)
  - [alg.findCycles](#alg-find-cycles)
  - [alg.floydWarshall](#alg-floyd-warshall)
  - [alg.isAcyclic](#alg-is-acyclic)
  - [alg.postorder](#alg-postorder)
  - [alg.preorder](#alg-preorder)
  - [alg.prim](#alg-prim)
  - [alg.tarjan](#alg-tarjan)
  - [alg.topsort](#alg-topsort)

## Graph Concepts

Graphlib has a single graph type: `Graph`. To create a new instance:

```js
var g = new Graph();
```

By default this will create a directed graph that does not allow multi-edges or compound nodes. The following options can be used when constructing a new graph:

- **directed**: set to `true` to get a directed graph and `false` to get an undirected graph. An undirected graph does not treat the order of nodes in an edge as significant. In other words, `g.edge("a", "b") === g.edge("b", "a")` for an undirected graph. Default: `true`.
- **multigraph**: set to `true` to allow a graph to have multiple edges between the same pair of nodes. Default: `false`.
- **compound**: set to `true` to allow a graph to have compound nodes - nodes which can be the parent of other nodes. Default: `false`.

To set the options, pass in an options object to the `Graph` constructor. For example, to create a directed compound multigraph:

```js
var g = new Graph({ directed: true, compound: true, multigraph: true });
```

### Node and Edge Representation

In graphlib, a node is represented by a user-supplied String id. All node related functions use this String id as a way to uniquely identify the node. Here is an example of interacting with nodes:

```js
var g = new Graph();
g.setNode("my-id", "my-label");
g.node("my-id"); // returns "my-label"
```

Edges in graphlib are identified by the nodes they connect. For example:

```js
var g = new Graph();
g.setEdge("source", "target", "my-label");
g.edge("source", "target"); // returns "my-label"
```

However, we need a way to uniquely identify an edge in a single object for various edge queries (e.g. [outEdges](#outEdges)). We use `edgeObj`s for this purpose. They consist of the following properties:

- **v**: the id of the source or tail node of an edge
- **w**: the id of the target or head node of an edge
- **name** (optional): the name that uniquely identifies a [multi-edge](#multigraphs).

Any edge function that takes an edge id will also work with an `edgeObj`. For example:

```js
var g = new Graph();
g.setEdge("source", "target", "my-label");
g.edge({ v: "source", w: "target" }); // returns "my-label"
```

### Multigraphs

A [multigraph](https://en.wikipedia.org/wiki/Multigraph) is a graph that can have more than one edge between the same pair of nodes. By default graphlib graphs are not multigraphs, but a multigraph can be constructed by setting the `multigraph` property to true:

```js
var g = new Graph({ multigraph: true });
```

With multiple edges between two nodes we need some way to uniquely identify each edge. We call this the `name` property. Here's an example of creating a couple of edges between the same nodes:

```js
var g = new Graph({ multigraph: true });
g.setEdge("a", "b", "edge1-label", "edge1");
g.setEdge("a", "b", "edge2-label", "edge2");
g.getEdge("a", "b", "edge1"); // returns "edge1-label"
g.getEdge("a", "b", "edge2"); // returns "edge2-label"
g.edges(); // returns [{ v: "a", w: "b", name: "edge1" },
//          { v: "a", w: "b", name: "edge2" }]
```

A multigraph still allows an edge with no name to be created:

```js
var g = new Graph({ multigraph: true });
g.setEdge("a", "b", "my-label");
g.edge({ v: "a", w: "b" }); // returns "my-label"
```

### Compound Graphs

A compound graph is one where a node can be the parent of other nodes. The child nodes form a "subgraph". Here's an example of constructing and interacting with a compound graph:

```js
var g = new Graph({ compound: true });
g.setParent("a", "parent");
g.setParent("b", "parent");
g.parent("a"); // returns "parent"
g.parent("b"); // returns "parent"
g.parent("parent"); // returns undefined
```

### Default Labels

When a node or edge is created without a label, a default label can be assigned. See [setDefaultNodeLabel](#setDefaultNodeLabel) and [setDefaultEdgeLabel](#setDefaultEdgeLabel).

## Graph API

<a name="isDirected" href="#isDirected">#</a> graph.**isDirected**()

Returns `true` if the graph is [directed](https://en.wikipedia.org/wiki/Directed_graph). A directed graph treats the order of nodes in an edge as significant whereas an [undirected](<https://en.wikipedia.org/wiki/Graph_(mathematics)#Undirected_graph>) graph does not. This example demonstrates the difference:

```js
var directed = new Graph({ directed: true });
directed.setEdge("a", "b", "my-label");
directed.edge("a", "b"); // returns "my-label"
directed.edge("b", "a"); // returns undefined

var undirected = new Graph({ directed: false });
undirected.setEdge("a", "b", "my-label");
undirected.edge("a", "b"); // returns "my-label"
undirected.edge("b", "a"); // returns "my-label"
```

<a name="isMultigraph" href="#isMultigraph">#</a> graph.**isMultigraph**()

Returns `true` if the graph is a [multigraph](#multigraphs).

<a name="isCompound" href="#isCompound">#</a> graph.**isCompound**()

Returns `true` if the graph is [compound](#compound-graphs).

<a name="graph" href="#graph">#</a> graph.**graph**()

Returns the currently assigned label for the graph. If no label has been assigned, returns `undefined`. Example:

```js
var g = new Graph();
g.graph(); // returns undefined
g.setGraph("graph-label");
g.graph(); // returns "graph-label"
```

<a name="setGraph" href="#setGraph">#</a> graph.**setGraph**(_label_)

Sets the label for the graph to `label`.

<a name="nodeCount" href="#nodeCount">#</a> graph.**nodeCount**()

Returns the number of nodes in the graph.

<a name="edgeCount" href="#edgeCount">#</a> graph.**edgeCount**()

Returns the number of edges in the graph.

<a name="setDefaultNodeLabel" href="#setDefaultNodeLabel">#</a> graph.**setDefaultNodeLabel**(val)

Sets a new default value that is assigned to nodes that are created without a label. If `val` is not a function it is assigned as the label directly. If `val` is a function, it is called with the id of the node being created.

<a name="setDefaultEdgeLabel" href="setDefaultEdgeLabel">#</a> graph.**setDefaultEdgeLabel**(val)

Sets a new default value that is assigned to edges that are created without a label. If `val` is not a function it is assigned as the label directly. If `val` is a function, it is called with the parameters `(v, w, name)`.

<a name="nodes" href="#nodes">#</a> graph.**nodes**()

Returns the ids of the nodes in the graph. Use [node(v)](#node) to get the label for each node. Takes `O(|V|)` time.

<a name="edges" href="#edges">#</a> graph.**edges**()

Returns the [`edgeObj`](#node-and-edge-representation) for each edge in the graph. Use [edge(edgeObj)](#edge) to get the label for each edge. Takes `O(|E|)` time.

<a name="sources" href="#sources">#</a> graph.**sources**()

Returns those nodes in the graph that have no in-edges. Takes `O(|V|)` time.

<a name="sinks" href="#sinks">#</a> graph.**sinks**()

Returns those nodes in the graph that have no out-edges. Takes `O(|V|)` time.

<a name="hasNode" href="#hasNode">#</a> graph.**hasNode**(_v_)

Returns `true` if the graph has a node with the id `v`. Takes `O(1)` time.

<a name="node" href="#node">#</a> graph.**node**(_v_)

Returns the label assigned to the node with the id `v` if it is in the graph. Otherwise returns `undefined`. Takes `O(1)` time.

<a name="setNode" href="#setNode">#</a> graph.**setNode**(_v_, _[label]_)

Creates or updates the value for the node `v` in the graph. If `label` is supplied it is set as the value for the node. If `label` is not supplied and the node was created by this call then the [default node label](#default-labels) will be assigned. Returns the graph, allowing this to be chained with other functions. Takes `O(1)` time.

<a name="removeNode" href="#removeNode">#</a> graph.**removeNode**(_v_)

Remove the node with the id `v` in the graph or do nothing if the node is not in the graph. If the node was removed this function also removes any incident edges. Returns the graph, allowing this to be chained with other functions. Takes `O(|E|)` time.

<a name="predecessors" href="#predecessors">#</a> graph.**predecessors**(_v_)

Return all nodes that are predecessors of the specified node or `undefined` if node `v` is not in the graph. Behavior is undefined for undirected graphs - use [neighbors](#neighbors) instead. Takes `O(|V|)` time.

<a name="successors" href="#successors">#</a> graph.**successors**(_v_)

Return all nodes that are successors of the specified node or `undefined` if node `v` is not in the graph. Behavior is undefined for undirected graphs - use [neighbors](#neighbors) instead. Takes `O(|V|)` time.

<a name="neighbors" href="#neighbors">#</a> graph.**neighbors**(_v_)

Return all nodes that are predecessors or successors of the specified node or `undefined` if node `v` is not in the graph. Takes `O(|V|)` time.

<a name="inEdges" href="#inEdges">#</a> graph.**inEdges**(_v_, _[u]_)

Return all edges that point to the node `v`. Optionally filters those edges down to just those coming from node `u`. Behavior is undefined for undirected graphs - use [nodeEdges](#nodeEdges) instead. Returns `undefined` if node `v` is not in the graph. Takes `O(|E|)` time.

<a name="outEdges" href="#outEdges">#</a> graph.**outEdges**(_v_, _[w]_)

Return all edges that are pointed at by node `v`. Optionally filters those edges down to just those point to `w`. Behavior is undefined for undirected graphs - use [nodeEdges](#nodeEdges) instead. Returns `undefined` if node `v` is not in the graph. Takes `O(|E|)` time.

<a name="nodeEdges" href="#nodeEdges">#</a> graph.**nodeEdges**(_v_, _[w]_)

Returns all edges to or from node `v` regardless of direction. Optionally filters those edges down to just those between nodes `v` and `w` regardless of direction. Returns `undefined` if node `v` is not in the graph. Takes `O(|E|)` time.

<a name="parent" href="#parent">#</a> graph.**parent**(_v_)

Returns the node that is a parent of node `v` or `undefined` if node `v` does not have a parent or is not a member of the graph. Always returns `undefined` for graphs that are not compound. Takes `O(1)` time.

<a name="children" href="#children">#</a> graph.**children**(_v_)

Returns all nodes that are children of node `v` or `undefined` if node `v` is not in the graph. Always returns `[]` for graphs that are not compound. Takes `O(|V|)` time.

<a name="setParent" href="#setParent">#</a> graph.**setParent**(_v_, _parent_)

Sets the parent for `v` to `parent` if it is defined or removes the parent for `v` if `parent` is undefined. Throws an error if the graph is not compound. Returns the graph, allowing this to be chained with other functions. Takes `O(1)` time.

<a name="hasEdge" href="#hasEdge">#</a> graph.**hasEdge**(_v_, _w_, _[name]_)
<a name="hasEdge2" href="#hasEdge2">#</a> graph.**hasEdge**(_edgeObj_)

Returns true if the graph has an edge between `v` and `w` with the optional `name`. The `name` parameter is only useful with [multigraphs](#multigraphs). `v` and `w` can be interchanged for undirected graphs. Takes `O(1)` time.

<a name="edge" href="#edge">#</a> graph.**edge**(_v_, _w_, _[name]_)
<a name="edge2" href="#edge2">#</a> graph.**edge**(_edgeObj_)

Returns the label for the edge (`v`, `w`) if the graph has an edge between `v` and `w` with the optional `name`. Returned `undefined` if there is no such edge in the graph. The `name` parameter is only useful with [multigraphs](#multigraphs). `v` and `w` can be interchanged for undirected graphs. Takes `O(1)` time.

<a name="setEdge" href="#setEdge">#</a> graph.**setEdge**(_v_, _w_, _[label]_, _[name]_)
<a name="setEdge2" href="#setEdge2">#</a> graph.**setEdge**(_edgeObj_, _[label]_)

Creates or updates the label for the edge (`v`, `w`) with the optionally supplied `name`. If `label` is supplied it is set as the value for the edge. If `label` is not supplied and the edge was created by this call then the [default edge label](#default-labels) will be assigned. The `name` parameter is only useful with [multigraphs](#multigraphs). Returns the graph, allowing this to be chained with other functions. Takes `O(1)` time.

<a name="removeEdge" href="#removeEdge">#</a> graph.**removeEdge**(_v_, _w_)

Removes the edge (`v`, `w`) if the graph has an edge between `v` and `w` with the optional `name`. If not this function does nothing. The `name` parameter is only useful with [multigraphs](#multigraphs). `v` and `w` can be interchanged for undirected graphs. Takes `O(1)` time.

## Serialization

<a name="json-write" href="#json-write">#</a> json.**write**(_g_)

Creates a JSONrepresentation of the graph that can be serialized to a string with [JSON.stringify](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify). The graph can later be restored using [json-read](#json-read).

```js
var g = new graphlib.Graph();
g.setNode("a", { label: "node a" });
g.setNode("b", { label: "node b" });
g.setEdge("a", "b", { label: "edge a->b" });
graphlib.json.write(g);
// Returns the object:
//
// {
//   "options": {
//     "directed": true,
//     "multigraph": false,
//     "compound": false
//   },
//   "nodes": [
//     { "v": "a", "value": { "label": "node a" } },
//     { "v": "b", "value": { "label": "node b" } }
//   ],
//   "edges": [
//     { "v": "a", "w": "b", "value": { "label": "edge a->b" } }
//   ]
// }
```

<a name="json-read" href="#json-read">#</a> json.**read**(_json_)

Takes JSON as input and returns the graph representation. For example, if we have serialized the graph in [json-write](#json-write) to a string named `str`, we can restore it to a graph as follows:

```js
var g2 = graphlib.json.read(JSON.parse(str));
// or, in order to copy the graph
var g3 = graphlib.json.read(graphlib.json.write(g));

g2.nodes();
// ['a', 'b']
g2.edges();
// [ { v: 'a', w: 'b' } ]
```

## Algorithms

<a name="alg-components" href="#alg-components">#</a> alg.**components**(_graph_)

Finds all [connected components][] in a graph and returns an array of these
components. Each component is itself an array that contains the ids of nodes
in the component.

This function takes `O(|V|)` time.

[connected components]: http://en.wikipedia.org/wiki/Connected_component_(graph_theory)

**Example**

![](https://github.com/cpettitt/graphlib/wiki/images/components.png)

```js
graphlib.alg.components(g);
// => [ [ 'A', 'B', 'C', 'D' ],
//      [ 'E', 'F', 'G' ],
//      [ 'H', 'I' ] ]
```

<a name="alg-dijkstra" href="#alg-dijkstra">#</a> alg.**dijkstra**(_graph_, _source_, _weightFn_, _edgeFn_)

This function is an implementation of [Dijkstra's algorithm][] which finds
the shortest path from `source` to all other nodes in `g`. This
function returns a map of `v -> { distance, predecessor }`. The distance
property holds the sum of the weights from `source` to `v` along the
shortest path or `Number.POSITIVE_INFINITY` if there is no path from
`source`. The predecessor property can be used to walk the individual
elements of the path from `source` to `v` in reverse order.

It takes an optional `weightFn(e)` which returns the weight of the edge
`e`. If no weightFn is supplied then each edge is assumed to have a
weight of 1. This function throws an `Error` if any of the traversed edges
have a negative edge weight.

It takes an optional `edgeFn(v)` which returns the ids of all edges
incident to the node `v` for the purposes of shortest path traversal. By
default this function uses the `g.outEdges`.

It takes `O((|E| + |V|) * log |V|)` time.

[dijkstra's algorithm]: http://en.wikipedia.org/wiki/Dijkstra%27s_algorithm

**Example**:

![](https://github.com/cpettitt/graphlib/wiki/images/dijkstra-source.png)

<!-- SOURCE:
http://cpettitt.github.io/project/dagre-d3/latest/demo/interactive-demo.html?graph=digraph%20%7B%0Anode%20%5Bshape%3Dcircle%2C%20style%3D%22fill%3Awhite%3Bstroke%3A%23333%3Bstroke-width%3A1.5px%22%5D%0Aedge%20%5Blabeloffset%3D2%20labelpos%3Dr%5D%0Arankdir%3Dlr%0A%20%20A%20-%3E%20B%5Blabel%3D10%5D%0A%20%20A%20-%3E%20C%5Blabel%3D4%5D%0A%20%20A%20-%3E%20D%5Blabel%3D2%5D%0A%20%20C%20-%3E%20B%5Blabel%3D2%5D%0A%20%20C%20-%3E%20D%5Blabel%3D8%5D%0A%20%20B%20-%3E%20E%5Blabel%3D6%5D%0A%20%20D%20-%3E%20F%5Blabel%3D2%5D%0A%20%20F%20-%3E%20E%5Blabel%3D4%5D%0A%7D
-->

```js
function weight(e) {
  return g.edge(e);
}

graphlib.alg.dijkstra(g, "A", weight);
// => { A: { distance: 0 },
//      B: { distance: 6, predecessor: 'C' },
//      C: { distance: 4, predecessor: 'A' },
//      D: { distance: 2, predecessor: 'A' },
//      E: { distance: 8, predecessor: 'F' },
//      F: { distance: 4, predecessor: 'D' } }
```

<a name="alg-dijkstra-all" href="#alg-dijkstra-all">#</a> alg.**dijkstraAll**(_graph_, _weightFn_, _edgeFn_)

This function finds the shortest path from each node to every other
reachable node in the graph. It is similar to
[`alg.dijkstra`](#alg-dijkstra), but instead of returning a single-source
array, it returns a mapping of of `source -> alg.dijksta(g, source, weightFn, edgeFn)`.

This function takes an optional `weightFn(e)` which returns the
weight of the edge `e`. If no weightFn is supplied then each edge is
assumed to have a weight of 1. This function throws an Error if any of
the traversed edges have a negative edge weight.

This function takes an optional `edgeFn(u)` which returns the ids of
all edges incident to the node `u` for the purposes of shortest path
traversal. By default this function uses `g.outEdges`.

This function takes `O(|V| * (|E| + |V|) * log |V|)` time.

**Example**:

![](https://github.com/cpettitt/graphlib/wiki/images/dijkstra-source.png)

```js
function weight(e) {
  return g.edge(e);
}

graphlib.alg.dijkstraAll(g, function(e) {
  return g.edge(e);
});

// => { A:
//       { A: { distance: 0 },
//         B: { distance: 6, predecessor: 'C' },
//         C: { distance: 4, predecessor: 'A' },
//         D: { distance: 2, predecessor: 'A' },
//         E: { distance: 8, predecessor: 'F' },
//         F: { distance: 4, predecessor: 'D' } },
//      B:
//       { A: { distance: Infinity },
//         B: { distance: 0 },
//         C: { distance: Infinity },
//         D: { distance: Infinity },
//         E: { distance: 6, predecessor: 'B' },
//         F: { distance: Infinity } },
//      C: { ... },
//      D: { ... },
//      E: { ... },
//      F: { ... } }
```

<a name="alg-find-cycles" href="#alg-find-cycles">#</a> alg.**findCycles**(_graph_)

Given a Graph, `g`, this function returns all nodes that  
are part of a cycle. As there may be more than one cycle in a graph this
function return an array of these cycles, where each cycle is itself  
represented by an array of ids for each node involved in that cycle.  
[`alg.isAcyclic`](#alg-is-acyclic) is more efficient if you only need to
determine whether a graph has a cycle or not.

```js
var g = new graphlib.Graph();
g.setNode(1);
g.setNode(2);
g.setNode(3);
g.setEdge(1, 2);
g.setEdge(2, 3);

graphlib.alg.findCycles(g);
// => []

g.setEdge(3, 1);
graphlib.alg.findCycles(g);
// => [ [ '3', '2', '1' ] ]

g.setNode(4);
g.setNode(5);
g.setEdge(4, 5);
g.setEdge(5, 4);
graphlib.alg.findCycles(g);
// => [ [ '3', '2', '1' ], [ '5', '4' ] ]
```

<a name="alg-floyd-warshall" href="#alg-floyd-warshall">#</a> alg.**floydWarshall**(_graph_, _weightFn_, _edgeFn_)

This function is an implementation of the [Floyd-Warshall algorithm][],
which finds the shortest path from each node to every other reachable node
in the graph. It is similar to [`alg.dijkstraAll`](#alg-dijkstra-all), but
it handles negative edge weights and is more efficient for some types of
graphs. This function returns a map of `source -> { target -> { distance, predecessor }`. The distance property holds the sum of the weights from
`source` to `target` along the shortest path of `Number.POSITIVE_INFINITY`
if there is no path from `source`. The predecessor property can be used to
walk the individual elements of the path from `source` to `target` in
reverse order.

This function takes an optional `weightFn(e)` which returns the
weight of the edge `e`. If no weightFunc is supplied then each edge is
assumed to have a weight of 1.

This function takes an optional `edgeFn(v)` which returns the ids of
all edges incident to the node `v` for the purposes of shortest path
traversal. By default this function uses the `outEdges` function on the
supplied graph.

This algorithm takes `O(|V|^3)` time.

[floyd-warshall algorithm]: https://en.wikipedia.org/wiki/Floyd-Warshall_algorithm

**Example**:

![](https://github.com/cpettitt/graphlib/wiki/images/dijkstra-source.png)

```js
function weight(e) {
  return g.edge(e);
}

graphlib.alg.floydWarshall(g, function(e) {
  return g.edge(e);
});

// => { A:
//       { A: { distance: 0 },
//         B: { distance: 6, predecessor: 'C' },
//         C: { distance: 4, predecessor: 'A' },
//         D: { distance: 2, predecessor: 'A' },
//         E: { distance: 8, predecessor: 'F' },
//         F: { distance: 4, predecessor: 'D' } },
//      B:
//       { A: { distance: Infinity },
//         B: { distance: 0 },
//         C: { distance: Infinity },
//         D: { distance: Infinity },
//         E: { distance: 6, predecessor: 'B' },
//         F: { distance: Infinity } },
//      C: { ... },
//      D: { ... },
//      E: { ... },
//      F: { ... } }
```

<a name="alg-is-acyclic" href="#alg-is-acyclic">#</a> alg.**isAcyclic**(_graph_)

Given a Graph, `g`, this function returns `true` if the  
graph has no cycles and returns `false` if it does. This algorithm returns
as soon as it detects the first cycle. You can use  
[`alg.findCycles`](#alg-find-cycles) to get the actual list of cycles in the
graph.

```js
var g = new graphlib.Graph();
g.setNode(1);
g.setNode(2);
g.setNode(3);
g.setEdge(1, 2);
g.setEdge(2, 3);

graphlib.alg.isAcyclic(g);
// => true

g.setEdge(3, 1);
graphlib.alg.isAcyclic(g);
// => false
```

<a name="alg-postorder" href="#alg-postorder">#</a> alg.**postorder**(_graph_, _vs_)

This function performs a [postorder traversal][] of the graph `g` starting
at the nodes `vs`. For each node visited, `v`, the function `callback(v)`
is called.

[postorder traversal]: https://en.wikipedia.org/wiki/Tree_traversal#Depth-first

![](https://github.com/cpettitt/graphlib/wiki/images/preorder.png)

```js
graphlib.alg.postorder(g, "A");
// => One of:
// [ "B", "D", "E", C", "A" ]
// [ "B", "E", "D", C", "A" ]
// [ "D", "E", "C", B", "A" ]
// [ "E", "D", "C", B", "A" ]
```

<a name="alg-preorder" href="#alg-preorder">#</a> alg.**preorder**(_graph_, _vs_)

This function performs a [preorder traversal][] of the graph `g` starting
at the nodes `vs`. For each node visited, `v`, the function `callback(v)`
is called.

[preorder traversal]: https://en.wikipedia.org/wiki/Tree_traversal#Depth-first

![](https://github.com/cpettitt/graphlib/wiki/images/preorder.png)

<!-- SOURCE:
http://cpettitt.github.io/project/dagre-d3/latest/demo/interactive-demo.html?graph=digraph%20%7B%0Anode%20%5Bshape%3Dcircle%2C%20style%3D%22fill%3Awhite%3Bstroke%3A%23333%3Bstroke-width%3A1.5px%22%5D%0Aedge%20%5Blabeloffset%3D2%20labelpos%3Dr%5D%0Arankdir%3Dlr%0A%20%20A%20-%3E%20B%0A%20%20A%20-%3E%20C%0A%20%20C%20-%3E%20D%0A%20%20C%20-%3E%20E%0A%7D
-->

```js
graphlib.alg.preorder(g, "A");
// => One of:
// [ "A", "B", "C", "D", "E" ]
// [ "A", "B", "C", "E", "D" ]
// [ "A", "C", "D", "E", "B" ]
// [ "A", "C", "E", "D", "B" ]
```

<a name="alg-prim" href="#alg-prim">#</a> alg.**prim**(_graph_, _weightFn_)

[Prim's algorithm][] takes a connected undirected graph and generates a
[minimum spanning tree][]. This function returns the minimum spanning
tree as an undirected graph. This algorithm is derived from the description
in "Introduction to Algorithms", Third Edition, Cormen, et al., Pg 634.

This function takes a `weightFn(e)` which returns the weight of the edge
`e`. It throws an Error if the graph is not connected.

This function takes `O(|E| log |V|)` time.

[prim's algorithm]: https://en.wikipedia.org/wiki/Prim's_algorithm
[minimum spanning tree]: https://en.wikipedia.org/wiki/Minimum_spanning_tree

**Example**:

![](https://github.com/cpettitt/graphlib/wiki/images/prim-input.png)

<!-- SOURCE:
digraph {
node [shape=circle, style="fill:white;stroke:#333;stroke-width:1.5px"]
edge [labeloffset=2 labelpos=r arrowhead="none"]
rankdir=lr
A -> B [label=3]
A -> D [label=12]
B -> C [label=6]
B -> D [label=1]
C -> D [label=1]
D -> E [label=2]
C -> E [label=9]
}
-->

```js
function weight(e) {
  return g(e);
}
graphlib.alg.prim(g, weight);
```

Returns a tree (represented as a Graph) of the following form:

![](https://github.com/cpettitt/graphlib/wiki/images/prim-output.png)

<!-- SOURCE:
digraph {
node [shape=circle, style="fill:white;stroke:#333;stroke-width:1.5px"]
edge [labeloffset=2 labelpos=r arrowhead="none"]
rankdir=lr
A -> B
B -> D
C -> D
D -> E
}
-->

<a name="alg-tarjan" href="#alg-tarjan">#</a> alg.**tarjan**(_graph_)

This function is an implementation of [Tarjan's algorithm][] which finds
all [strongly connected components][] in the directed graph `g`. Each
strongly connected component is composed of nodes that can reach all other
nodes in the component via directed edges. A strongly connected component
can consist of a single node if that node cannot both reach and be reached
by any other specific node in the graph. Components of more than one node
are guaranteed to have at least one cycle.

This function returns an array of components. Each component is itself an
array that contains the ids of all nodes in the component.

[tarjan's algorithm]: http://en.wikipedia.org/wiki/Tarjan's_strongly_connected_components_algorithm
[strongly connected components]: http://en.wikipedia.org/wiki/Strongly_connected_component

**Example**:

![](https://github.com/cpettitt/graphlib/wiki/images/tarjan.png)

<!-- SOURCE:
digraph {
node [shape=circle, style="fill:white;stroke:#333;stroke-width:1.5px"]
edge [lineInterpolate=bundle]
rankdir=lr

A -> B -> C -> D -> H -> G -> F
F -> G
D -> C
H -> D
B -> E -> G
E -> A
}
-->

```js
graphlib.alg.tarjan(g);
// => [ [ 'F', 'G' ],
//      [ 'H', 'D', 'C' ],
//      [ 'E', 'B', 'A' ] ]
```

<a name="alg-topsort" href="#alg-topsort">#</a> alg.**topsort**(_graph_)

An implementation of [topological sorting](https://en.wikipedia.org/wiki/Topological_sorting).

Given a Graph `g` this function returns an array of nodes
such that for each edge `u -> v`, `u` appears before `v` in the array. If
the graph has a cycle it is impossible to generate such a list and
`CycleException` is thrown.

Takes `O(|V| + |E|)` time.

**Example**:

![](https://github.com/cpettitt/graphlib/wiki/images/topsort.png)

```js
graphlib.alg.topsort(g);
// [ '1', '2', '3', '4' ] or [ '1', '3', '2', '4' ]
```
