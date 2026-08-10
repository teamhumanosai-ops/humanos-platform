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
    return graphStore.getNode(
      id
    );
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
      new Map<
        string,
        GraphNode
      >();

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
    nodeId: string,
    type?: GraphEdgeType
  ): GraphEdge[] {
    return graphStore
      .getEdges()
      .filter(
        (edge) =>
          edge.from === nodeId &&
          (
            type === undefined ||
            edge.type === type
          )
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
          (
            type === undefined ||
            edge.type === type
          )
      );
  }

  getRelatedNodes(
    nodeId: string,
    type?: GraphEdgeType
  ): GraphNode[] {
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

    const related =
      new Map<
        string,
        GraphNode
      >();

    for (
      const edge of
      relationships
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

  getOutgoingNodes(
    nodeId: string,
    type?: GraphEdgeType
  ): GraphNode[] {
    const relationships =
      this.getOutgoingRelationships(
        nodeId
      ).filter(
        (edge) =>
          type === undefined ||
          edge.type === type
      );

    const nodes =
      new Map<
        string,
        GraphNode
      >();

    for (
      const edge of
      relationships
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
          type === undefined ||
          edge.type === type
      );

    const nodes =
      new Map<
        string,
        GraphNode
      >();

    for (
      const edge of
      relationships
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
        b.weight -
        a.weight
    );
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
          (
            to === undefined ||
            edge.to === to
          )
      );
  }

  findRelatedByLabel(
    label: string,
    type?: GraphEdgeType
  ): GraphNode[] {
    const normalized =
      label
        .trim()
        .toLowerCase();

    if (!normalized) {
      return [];
    }

    const nodes =
      this.search(
        normalized
      );

    const related =
      new Map<
        string,
        GraphNode
      >();

    for (
      const node of nodes
    ) {
      for (
        const relatedNode of
        this.getRelatedNodes(
          node.id,
          type
        )
      ) {
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

  /*
  |--------------------------------------------------------------------------
  | Timeline Queries
  |--------------------------------------------------------------------------
  */

  getTimelineEvents():
    GraphNode[] {
    return this.findByType(
      "timeline"
    );
  }

  getTimelineEventsByCategory(
    category: string
  ): GraphNode[] {
    const normalizedCategory =
      category
        .trim()
        .toLowerCase();

    if (
      !normalizedCategory
    ) {
      return [];
    }

    return this
      .getTimelineEvents()
      .filter(
        (node) =>
          String(
            node.properties
              .category ??
              ""
          )
            .trim()
            .toLowerCase() ===
          normalizedCategory
      );
  }

  getTimelineEventCategories(
    nodeId: string
  ): GraphNode[] {
    return this
      .getOutgoingNodes(
        nodeId,
        "belongs_to"
      )
      .filter(
        (node) =>
          node.type ===
            "entity" &&
          node.properties
            .source ===
            "timeline"
      );
  }

  getTimelineEventsForCategory(
    categoryId: string
  ): GraphNode[] {
    return this
      .getIncomingNodes(
        categoryId,
        "belongs_to"
      )
      .filter(
        (node) =>
          node.type ===
          "timeline"
      );
  }

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

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
          (
            type === undefined ||
            edge.type === type
          )
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