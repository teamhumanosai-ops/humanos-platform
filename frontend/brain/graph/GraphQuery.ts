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
    const neighbors: GraphNode[] = [];

    for (const edge of graphStore.getEdges()) {
      if (edge.from === nodeId) {
        const node = graphStore.getNode(edge.to);

        if (node) {
          neighbors.push(node);
        }
      }

      if (edge.to === nodeId) {
        const node = graphStore.getNode(edge.from);

        if (node) {
          neighbors.push(node);
        }
      }
    }

    return neighbors;
  }

  findByType(type: GraphNode["type"]): GraphNode[] {
    return graphStore
      .getNodes()
      .filter((node) => node.type === type);
  }

  search(label: string): GraphNode[] {
    const query = label.toLowerCase();

    return graphStore.getNodes().filter((node) => {
      return (
        node.label.toLowerCase().includes(query) ||
        node.id.toLowerCase().includes(query)
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
}

export const graphQuery = new GraphQuery();