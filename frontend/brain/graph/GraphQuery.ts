import { graphStore } from "./GraphStore";
import { GraphEdge, GraphNode } from "./types";

export class GraphQuery {
  getNode(id: string): GraphNode | undefined {
    return graphStore.getNode(id);
  }

  getNodes(): GraphNode[] {
    return graphStore.getNodes();
  }

  getEdges(): GraphEdge[] {
    return graphStore.getEdges();
  }

  getNeighbors(nodeId: string): GraphNode[] {
    const neighbors = new Map<string, GraphNode>();

    for (const edge of graphStore.getEdges()) {
      if (edge.from === nodeId) {
        const node = graphStore.getNode(edge.to);

        if (node) {
          neighbors.set(node.id, node);
        }
      }

      if (edge.to === nodeId) {
        const node = graphStore.getNode(edge.from);

        if (node) {
          neighbors.set(node.id, node);
        }
      }
    }

    return [...neighbors.values()];
  }

  getRelationships(nodeId: string): GraphEdge[] {
    return graphStore.getEdges().filter(
      (edge) =>
        edge.from === nodeId ||
        edge.to === nodeId
    );
  }

  findByType(
    type: GraphNode["type"]
  ): GraphNode[] {
    return graphStore
      .getNodes()
      .filter((node) => node.type === type);
  }

  search(query: string): GraphNode[] {
    const normalized =
      query.trim().toLowerCase();

    return graphStore.getNodes().filter((node) => {
      return (
        node.id.toLowerCase().includes(normalized) ||
        node.label
          .toLowerCase()
          .includes(normalized)
      );
    });
  }

  hasRelationship(
    from: string,
    to: string
  ): boolean {
    return graphStore
      .getEdges()
      .some(
        (edge) =>
          edge.from === from &&
          edge.to === to
      );
  }

  getConnectedSubgraph(
    nodeId: string
  ): {
    node: GraphNode | undefined;
    neighbors: GraphNode[];
    relationships: GraphEdge[];
  } {
    return {
      node: this.getNode(nodeId),
      neighbors: this.getNeighbors(nodeId),
      relationships:
        this.getRelationships(nodeId),
    };
  }
}

export const graphQuery =
  new GraphQuery();