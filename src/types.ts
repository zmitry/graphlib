declare module "graph" {
  export interface GraphOptions {
    directed?: boolean; // default: true.
    multigraph?: boolean; // default: false.
    compound?: boolean; // default: false.
  }

  export interface Edge {
    v: string;
    w: string;
    /** The name that uniquely identifies a multi-edge. */
    name?: string;
  }

  export class Graph<NodeLabel = any, EdgeLabel = any> {
    constructor(options?: GraphOptions);

    /**
     * Sets the default node label. This label will be assigned as default label
     * in case if no label was specified while setting a node.
     * Complexity: O(1).
     *
     * @argument label - default node label.
     * @returns the graph, allowing this to be chained with other functions.
     */
    setDefaultNodeLabel(label: NodeLabel): Graph<NodeLabel, EdgeLabel>;

    /**
     * Sets the default node label factory function. This function will be invoked
     * each time when setting a node with no label specified and returned value
     * will be used as a label for node.
     * Complexity: O(1).
     *
     * @argument labelFn - default node label factory function.
     * @returns the graph, allowing this to be chained with other functions.
     */
    setDefaultNodeLabel(
      labelFn: (v: string) => NodeLabel
    ): Graph<NodeLabel, EdgeLabel>;

    /**
     * Creates or updates the value for the node v in the graph. If label is supplied
     * it is set as the value for the node. If label is not supplied and the node was
     * created by this call then the default node label will be assigned.
     * Complexity: O(1).
     *
     * @argument name - node name.
     * @argument label - value to set for node.
     * @returns the graph, allowing this to be chained with other functions.
     */
    setNode(name: string, label?: NodeLabel): Graph<NodeLabel, EdgeLabel>;

    /**
     * Invokes setNode method for each node in names list.
     * Complexity: O(|names|).
     *
     * @argument names - list of nodes names to be set.
     * @argument label - value to set for each node in list.
     * @returns the graph, allowing this to be chained with other functions.
     */
    setNodes(names: string[], label?: NodeLabel): Graph<NodeLabel, EdgeLabel>;

    /**
     * Sets node p as a parent for node v if it is defined, or removes the
     * parent for v if p is undefined. Method throws an exception in case of
     * invoking it in context of noncompound graph.
     * Average-case complexity: O(1).
     *
     * @argument v - node to be child for p.
     * @argument p - node to be parent for v.
     * @returns the graph, allowing this to be chained with other functions.
     */
    setParent(v: string, p?: string): Graph<NodeLabel, EdgeLabel>;

    /**
     * Gets parent node for node v.
     * Complexity: O(1).
     *
     * @argument v - node to get parent of.
     * @returns parent node name or void if v has no parent.
     */
    parent(v: string): string | void;

    /**
     * Gets list of direct children of node v.
     * Complexity: O(1).
     *
     * @argument v - node to get children of.
     * @returns children nodes names list.
     */
    children(v: string): string[];

    /**
     * Creates new graph with nodes filtered via filter. Edges incident to rejected node
     * are also removed. In case of compound graph, if parent is rejected by filter,
     * than all its children are rejected too.
     * Average-case complexity: O(|E|+|V|).
     *
     * @argument filter - filtration function detecting whether the node should stay or not.
     * @returns new graph made from current and nodes filtered.
     */
    filterNodes(filter: (v: string) => boolean): Graph<NodeLabel, EdgeLabel>;

    /**
     * Sets the default edge label. This label will be assigned as default label
     * in case if no label was specified while setting an edge.
     * Complexity: O(1).
     *
     * @argument label - default edge label.
     * @returns the graph, allowing this to be chained with other functions.
     */
    setDefaultEdgeLabel(label: EdgeLabel): Graph<NodeLabel, EdgeLabel>;

    /**
     * Sets the default edge label factory function. This function will be invoked
     * each time when setting an edge with no label specified and returned value
     * will be used as a label for edge.
     * Complexity: O(1).
     *
     * @argument labelFn - default edge label factory function.
     * @returns the graph, allowing this to be chained with other functions.
     */
    setDefaultEdgeLabel(
      labelFn: (v: string) => EdgeLabel
    ): Graph<NodeLabel, EdgeLabel>;

    /**
     * Establish an edges path over the nodes in nodes list. If some edge is already
     * exists, it will update its label, otherwise it will create an edge between pair
     * of nodes with label provided or default label if no label provided.
     * Complexity: O(|nodes|).
     *
     * @argument nodes - list of nodes to be connected in series.
     * @argument label - value to set for each edge between pairs of nodes.
     * @returns the graph, allowing this to be chained with other functions.
     */
    setPath(nodes: string[], label?: EdgeLabel): Graph<NodeLabel, EdgeLabel>;

    /**
     * Detects whether graph has a node with specified name or not.
     *
     * @argument name - name of the node.
     * @returns true if graph has node with specified name, false - otherwise.
     */
    hasNode(name: string): boolean;

    /**
     * Remove the node with the name from the graph or do nothing if the node is not in
     * the graph. If the node was removed this function also removes any incident
     * edges.
     * Complexity: O(1).
     *
     * @argument name - name of the node.
     * @returns the graph, allowing this to be chained with other functions.
     */
    removeNode(name: string): Graph<NodeLabel, EdgeLabel>;

    /**
     * Gets all nodes of the graph. Note, the in case of compound graph subnodes are
     * not included in list.
     * Complexity: O(1).
     *
     * @returns list of graph nodes.
     */
    nodes(): string[];

    /**
     * Gets the label of node with specified name.
     * Complexity: O(|V|).
     *
     * @returns label value of the node.
     */
    node(name: string): NodeLabel;

    /**
     * Creates or updates the label for the edge (v, w) with the optionally supplied
     * name. If label is supplied it is set as the value for the edge. If label is not
     * supplied and the edge was created by this call then the default edge label will
     * be assigned. The name parameter is only useful with multigraphs.
     * Complexity: O(1).
     *
     * @argument v - edge source node.
     * @argument w - edge sink node.
     * @argument label - value to associate with the edge.
     * @argument name - unique name of the edge in order to identify it in multigraph.
     * @returns the graph, allowing this to be chained with other functions.
     */
    setEdge(
      v: string,
      w: string,
      label?: EdgeLabel,
      name?: string
    ): Graph<NodeLabel, EdgeLabel>;

    /**
     * Creates or updates the label for the specified edge. If label is supplied it is
     * set as the value for the edge. If label is not supplied and the edge was created
     * by this call then the default edge label will be assigned. The name parameter is
     * only useful with multigraphs.
     * Complexity: O(1).
     *
     * @argument edge - edge descriptor.
     * @argument label - value to associate with the edge.
     * @returns the graph, allowing this to be chained with other functions.
     */
    setEdge(edge: Edge, label?: EdgeLabel): Graph<NodeLabel, EdgeLabel>;

    /**
     * Gets edges of the graph. In case of compound graph subgraphs are not considered.
     * Complexity: O(|E|).
     *
     * @return graph edges list.
     */
    edges(): Edge[];

    /**
     * Gets the label for the specified edge.
     * Complexity: O(1).
     *
     * @argument v - edge source node.
     * @argument w - edge sink node.
     * @argument name - name of the edge (actual for multigraph<any,any>).
     * @returns value associated with specified edge.
     */
    edge(v: string, w: string, name?: string): EdgeLabel;

    /**
     * Gets the label for the specified edge.
     * Complexity: O(1).
     *
     * @argument edge - edge descriptor.
     * @returns value associated with specified edge.
     */
    edge(e: Edge): EdgeLabel;

    /**
     * Detects whether the graph contains specified edge or not. No subgraphs are considered.
     * Complexity: O(1).
     *
     * @argument v - edge source node.
     * @argument w - edge sink node.
     * @argument name - name of the edge (actual for multigraph<any,any>).
     * @returns whether the graph contains the specified edge or not.
     */
    hasEdge(v: string, w: string, name?: string): boolean;

    /**
     * Detects whether the graph contains specified edge or not. No subgraphs are considered.
     * Complexity: O(1).
     *
     * @argument edge - edge descriptor.
     * @returns whether the graph contains the specified edge or not.
     */
    hasEdge(edge: Edge): boolean;

    /**
     * Removes the specified edge from the graph. No subgraphs are considered.
     * Complexity: O(1).
     *
     * @argument edge - edge descriptor.
     * @returns the graph, allowing this to be chained with other functions.
     */
    removeEdge(edge: Edge): Graph<NodeLabel, EdgeLabel>;

    /**
     * Removes the specified edge from the graph. No subgraphs are considered.
     * Complexity: O(1).
     *
     * @argument v - edge source node.
     * @argument w - edge sink node.
     * @argument name - name of the edge (actual for multigraph<any,any>).
     * @returns the graph, allowing this to be chained with other functions.
     */
    removeEdge(
      v: string,
      w: string,
      name?: string
    ): Graph<NodeLabel, EdgeLabel>;

    /**
     * Return all edges that point to the node v. Optionally filters those edges down to just those
     * coming from node u. Behavior is undefined for undirected graphs - use nodeEdges instead.
     * Complexity: O(|E|).
     *
     * @argument v - edge sink node.
     * @argument w - edge source node.
     * @returns edges descriptors list if v is in the graph, or undefined otherwise.
     */
    inEdges(v: string, w?: string): void | Edge[];

    /**
     * Return all edges that are pointed at by node v. Optionally filters those edges down to just
     * those point to w. Behavior is undefined for undirected graphs - use nodeEdges instead.
     * Complexity: O(|E|).
     *
     * @argument v - edge source node.
     * @argument w - edge sink node.
     * @returns edges descriptors list if v is in the graph, or undefined otherwise.
     */
    outEdges(v: string, w?: string): void | Edge[];

    /**
     * Returns all edges to or from node v regardless of direction. Optionally filters those edges
     * down to just those between nodes v and w regardless of direction.
     * Complexity: O(|E|).
     *
     * @argument v - edge adjacent node.
     * @argument w - edge adjacent node.
     * @returns edges descriptors list if v is in the graph, or undefined otherwise.
     */
    nodeEdges(v: string, w?: string): void | Edge[];

    /**
     * Return all nodes that are predecessors of the specified node or undefined if node v is not in
     * the graph. Behavior is undefined for undirected graphs - use neighbors instead.
     * Complexity: O(|V|).
     *
     * @argument v - node identifier.
     * @returns node identifiers list or undefined if v is not in the graph.
     */
    predecessors(v: string): void | string[];

    /**
     * Return all nodes that are successors of the specified node or undefined if node v is not in
     * the graph. Behavior is undefined for undirected graphs - use neighbors instead.
     * Complexity: O(|V|).
     *
     * @argument v - node identifier.
     * @returns node identifiers list or undefined if v is not in the graph.
     */
    successors(v: string): void | string[];

    /**
     * Return all nodes that are predecessors or successors of the specified node or undefined if
     * node v is not in the graph.
     * Complexity: O(|V|).
     *
     * @argument v - node identifier.
     * @returns node identifiers list or undefined if v is not in the graph.
     */

    neighbors(v: string): void | string[];

    /**
     * Whether graph was created with 'directed' flag set to true or not.
     *
     * @returns whether the graph edges have an orientation.
     */
    isDirected(): boolean;

    /**
     * Whether graph was created with 'multigraph' flag set to true or not.
     *
     * @returns whether the pair of nodes of the graph can have multiple edges.
     */
    isMultigraph(): boolean;

    /**
     * Whether graph was created with 'compound' flag set to true or not.
     *
     * @returns whether a node of the graph can have subnodes.
     */
    isCompound(): boolean;

    /**
     * Sets the label of the graph.
     *
     * @argument label - label value.
     * @returns the graph, allowing this to be chained with other functions.
     */
    setGraph(label: string): Graph<NodeLabel, EdgeLabel>;

    /**
     * Gets the graph label.
     *
     * @returns currently assigned label for the graph or undefined if no label assigned.
     */
    graph(): void | string;

    /**
     * Gets the number of nodes in the graph.
     * Complexity: O(1).
     *
     * @returns nodes count.
     */
    nodeCount(): number;

    /**
     * Gets the number of edges in the graph.
     * Complexity: O(1).
     *
     * @returns edges count.
     */
    edgeCount(): number;

    /**
     * Gets list of nodes without in-edges.
     * Complexity: O(|V|).
     *
     * @returns the graph source nodes.
     */
    sources(): string[];

    /**
     * Gets list of nodes without out-edges.
     * Complexity: O(|V|).
     *
     * @returns the graph source nodes.
     */
    sinks(): string[];
  }
  export function writeJSON(graph: Graph): Object;
  export function readJSON<N = any, L = any>(graphJSON: object): Graph<N, L>;
  export function writeDot<N, L>(g: Graph<N, L>): string;
}
