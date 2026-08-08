import { graphStore } from "./GraphStore";
import {
  GraphEdge,
  GraphEdgeType,
  GraphNode,
} from "./types";

export class GraphQuery {
  getNode(
    id: string
  ): GraphNode | undefined {
    return graphStore.getNode(id);
  }

  getNodes(): GraphNode[] {
    return graphStore.getNodes();
  }

  getEdges(): GraphEdge[] {
    return graphStore.getEdges();
  }

  getNeighbors(
    nodeId: string
  ): GraphNode[] {
    const neighbors =
      new Map<string, GraphNode>();

    for (const edge of graphStore.getEdges()) {
      if (edge.from === nodeId) {
        const node =
          graphStore.getNode(edge.to);

        if (node) {
          neighbors.set(
            node.id,
            node
          );
        }
      }

      if (edge.to === nodeId) {
        const node =
          graphStore.getNode(edge.from);

        if (node) {
          neighbors.set(
            node.id,
            node
          );
        }
      }
    }

    return [
      ...neighbors.values(),
    ];
  }

  getRelationships(
    nodeId: string
  ): GraphEdge[] {
    return graphStore
      .getEdges()
      .filter(
        (edge) =>
          edge.from === nodeId ||
          edge.to === nodeId
      );
  }

  getOutgoingRelationships(
    nodeId: string,
    type?: GraphEdgeType
  ): GraphEdge[] {
    return graphStore
      .getEdges()
      .filter(
        (edge) =>
          edge.from === nodeId &&
          (type === undefined ||
            edge.type === type)
      );
  }

  getIncomingRelationships(
    nodeId: string,
    type?: GraphEdgeType
  ): GraphEdge[] {
    return graphStore
      .getEdges()
      .filter(
        (edge) =>
          edge.to === nodeId &&
          (type === undefined ||
            edge.type === type)
      );
  }

  getRelatedNodes(
    nodeId: string,
    type?: GraphEdgeType
  ): GraphNode[] {
    const related =
      new Map<string, GraphNode>();

    const relationships =
      type === undefined
        ? this.getRelationships(
            nodeId
          )
        : this.getRelationships(
            nodeId
          ).filter(
            (edge) =>
              edge.type === type
          );

    for (const edge of relationships) {
      const relatedId =
        edge.from === nodeId
          ? edge.to
          : edge.from;

      const node =
        graphStore.getNode(
          relatedId
        );

      if (node) {
        related.set(
          node.id,
          node
        );
      }
    }

    return [
      ...related.values(),
    ];
  }

  findByRelationship(
    from: string,
    type: GraphEdgeType,
    to?: string
  ): GraphEdge[] {
    return graphStore
      .getEdges()
      .filter(
        (edge) =>
          edge.from === from &&
          edge.type === type &&
          (to === undefined ||
            edge.to === to)
      );
  }

  findRelatedByLabel(
    label: string,
    type?: GraphEdgeType
  ): GraphNode[] {
    const normalized =
      label.trim().toLowerCase();

    const nodes =
      this.search(normalized);

    const related =
      new Map<string, GraphNode>();

    for (const node of nodes) {
      for (const relatedNode of
        this.getRelatedNodes(
          node.id,
          type
        )) {
        related.set(
          relatedNode.id,
          relatedNode
        );
      }
    }

    return [
      ...related.values(),
    ];
  }

  findByType(
    type: GraphNode["type"]
  ): GraphNode[] {
    return graphStore
      .getNodes()
      .filter(
        (node) =>
          node.type === type
      );
  }

  search(
    query: string
  ): GraphNode[] {
    const normalized =
      query
        .trim()
        .toLowerCase();

    if (!normalized) {
      return [];
    }

    return graphStore
      .getNodes()
      .filter((node) => {
        return (
          node.id
            .toLowerCase()
            .includes(normalized) ||
          node.label
            .toLowerCase()
            .includes(normalized)
        );
      });
  }

  hasRelationship(
    from: string,
    to: string,
    type?: GraphEdgeType
  ): boolean {
    return graphStore
      .getEdges()
      .some(
        (edge) =>
          edge.from === from &&
          edge.to === to &&
          (type === undefined ||
            edge.type === type)
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
      node:
        this.getNode(nodeId),

      neighbors:
        this.getNeighbors(nodeId),

      relationships:
        this.getRelationships(nodeId),
    };
  }
}

export const graphQuery =
  new GraphQuery();