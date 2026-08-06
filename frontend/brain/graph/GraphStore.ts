import {
  GraphEdge,
  GraphNode,
  KnowledgeGraph,
} from "./types";

class GraphStore {
  private graph: KnowledgeGraph = {
    nodes: new Map(),
    edges: new Map(),
  };

  getGraph(): KnowledgeGraph {
    return this.graph;
  }

  getNodes(): GraphNode[] {
    return [...this.graph.nodes.values()];
  }

  getEdges(): GraphEdge[] {
    return [...this.graph.edges.values()];
  }

  getNode(id: string): GraphNode | undefined {
    return this.graph.nodes.get(id);
  }

  getEdge(id: string): GraphEdge | undefined {
    return this.graph.edges.get(id);
  }

  addNode(node: GraphNode): void {
    this.graph.nodes.set(node.id, node);
  }

  addEdge(edge: GraphEdge): void {
    if (!this.graph.nodes.has(edge.from)) {
      throw new Error(
        `Graph node '${edge.from}' does not exist.`
      );
    }

    if (!this.graph.nodes.has(edge.to)) {
      throw new Error(
        `Graph node '${edge.to}' does not exist.`
      );
    }

    this.graph.edges.set(edge.id, edge);
  }

  hasNode(id: string): boolean {
    return this.graph.nodes.has(id);
  }

  hasEdge(id: string): boolean {
    return this.graph.edges.has(id);
  }

  removeNode(id: string): void {
    this.graph.nodes.delete(id);

    for (const [edgeId, edge] of this.graph.edges) {
      if (edge.from === id || edge.to === id) {
        this.graph.edges.delete(edgeId);
      }
    }
  }

  removeEdge(id: string): void {
    this.graph.edges.delete(id);
  }

  clear(): void {
    this.graph.nodes.clear();
    this.graph.edges.clear();
  }
}

export const graphStore = new GraphStore();