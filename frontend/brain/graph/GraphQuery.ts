import {
  graphStore,
} from "./GraphStore";

import type {
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

    for (
      const edge of
        graphStore.getEdges()
    ) {
      if (
        edge.from === nodeId
      ) {
        const node =
          graphStore.getNode(
            edge.to
          );

        if (node) {
          neighbors.set(
            node.id,
            node
          );
        }
      }

      if (
        edge.to === nodeId
      ) {
        const node =
          graphStore.getNode(
            edge.from
          );

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

  getRelationshipsByType(
    nodeId: string,
    type: GraphEdgeType
  ): GraphEdge[] {
    return this.getRelationships(
      nodeId
    ).filter(
      (edge) =>
        edge.type === type
    );
  }

  getOutgoingRelationships(
    nodeId: string
  ): GraphEdge[] {
    return graphStore
      .getEdges()
      .filter(
        (edge) =>
          edge.from === nodeId
      );
  }

  getIncomingRelationships(
    nodeId: string
  ): GraphEdge[] {
    return graphStore
      .getEdges()
      .filter(
        (edge) =>
          edge.to === nodeId
      );
  }

  getRelatedNodes(
    nodeId: string,
    type?: GraphEdgeType
  ): GraphNode[] {
    const relationships =
      type
        ? this.getRelationshipsByType(
            nodeId,
            type
          )
        : this.getRelationships(
            nodeId
          );

    const nodes =
      new Map<string, GraphNode>();

    for (
      const edge of relationships
    ) {
      const relatedId =
        edge.from === nodeId
          ? edge.to
          : edge.from;

      const node =
        graphStore.getNode(
          relatedId
        );

      if (node) {
        nodes.set(
          node.id,
          node
        );
      }
    }

    return [
      ...nodes.values(),
    ];
  }

  getOutgoingNodes(
    nodeId: string,
    type?: GraphEdgeType
  ): GraphNode[] {
    const relationships =
      this.getOutgoingRelationships(
        nodeId
      ).filter(
        (edge) =>
          !type ||
          edge.type === type
      );

    const nodes =
      new Map<string, GraphNode>();

    for (
      const edge of relationships
    ) {
      const node =
        graphStore.getNode(
          edge.to
        );

      if (node) {
        nodes.set(
          node.id,
          node
        );
      }
    }

    return [
      ...nodes.values(),
    ];
  }

  getIncomingNodes(
    nodeId: string,
    type?: GraphEdgeType
  ): GraphNode[] {
    const relationships =
      this.getIncomingRelationships(
        nodeId
      ).filter(
        (edge) =>
          !type ||
          edge.type === type
      );

    const nodes =
      new Map<string, GraphNode>();

    for (
      const edge of relationships
    ) {
      const node =
        graphStore.getNode(
          edge.from
        );

      if (node) {
        nodes.set(
          node.id,
          node
        );
      }
    }

    return [
      ...nodes.values(),
    ];
  }

  getWeightedRelationships(
    nodeId: string
  ): GraphEdge[] {
    return this.getRelationships(
      nodeId
    ).sort(
      (a, b) =>
        b.weight - a.weight
    );
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

  findRelationshipsByType(
    type: GraphEdgeType
  ): GraphEdge[] {
    return graphStore
      .getEdges()
      .filter(
        (edge) =>
          edge.type === type
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
      .filter(
        (node) =>
          node.id
            .toLowerCase()
            .includes(
              normalized
            ) ||
          node.label
            .toLowerCase()
            .includes(
              normalized
            )
      );
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
          (!type ||
            edge.type === type)
      );
  }

  getConnectedSubgraph(
    nodeId: string
  ): {
    node:
      | GraphNode
      | undefined;

    neighbors:
      GraphNode[];

    relationships:
      GraphEdge[];
  } {
    return {
      node:
        this.getNode(
          nodeId
        ),

      neighbors:
        this.getNeighbors(
          nodeId
        ),

      relationships:
        this.getRelationships(
          nodeId
        ),
    };
  }
}

export const graphQuery =
  new GraphQuery();