import {
  graphStore,
} from "./GraphStore";

import type {
  GraphEdge,
  GraphNode,
} from "./types";

const DEFAULT_MAX_NODES = 20;

const DEFAULT_MAX_DEPTH = 2;

const MIN_QUERY_TOKEN_LENGTH = 3;

const DIRECT_MATCH_SCORE = 3;

const PARTIAL_MATCH_SCORE = 1;

const PROPERTY_MATCH_SCORE = 1;

const RELATED_NODE_SCORE_FACTOR = 0.5;

const FALLBACK_NODE_SCORE_FACTOR = 0.1;

export type RelevantGraphOptions = {
  maxNodes?: number;

  maxDepth?: number;

  minTokenLength?: number;
};

export type RelevantGraphSubgraph = {
  nodes: GraphNode[];

  edges: GraphEdge[];
};

function normalize(
  value: string
): string {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9\s-_]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function getQueryTokens(
  query: string,
  minTokenLength =
    MIN_QUERY_TOKEN_LENGTH
): string[] {
  const normalized =
    normalize(
      query
    );

  if (
    !normalized
  ) {
    return [];
  }

  return [
    ...new Set(
      normalized
        .split(/\s+/)
        .map(
          (token) =>
            token.trim()
        )
        .filter(
          (token) =>
            token.length >=
            minTokenLength
        )
    ),
  ];
}

function getNodePropertyText(
  node: GraphNode
): string {
  return normalize(
    Object.values(
      node.properties
    )
      .filter(
        (
          value
        ): value is
          | string
          | number
          | boolean =>
          typeof value ===
            "string" ||
          typeof value ===
            "number" ||
          typeof value ===
            "boolean"
      )
      .join(" ")
  );
}

function scoreNode(
  node: GraphNode,
  tokens: string[]
): number {
  if (
    tokens.length === 0
  ) {
    return 0;
  }

  const id =
    normalize(
      node.id
    );

  const label =
    normalize(
      node.label
    );

  const properties =
    getNodePropertyText(
      node
    );

  return tokens.reduce(
    (
      score,
      token
    ) => {
      if (
        id === token ||
        label === token
      ) {
        return (
          score +
          DIRECT_MATCH_SCORE
        );
      }

      if (
        id.includes(token) ||
        label.includes(token)
      ) {
        return (
          score +
          PARTIAL_MATCH_SCORE
        );
      }

      if (
        properties.includes(
          token
        )
      ) {
        return (
          score +
          PROPERTY_MATCH_SCORE
        );
      }

      return score;
    },
    0
  );
}

function scoreEdge(
  edge: GraphEdge,
  nodesById: Map<
    string,
    GraphNode
  >,
  tokens: string[]
): number {
  const from =
    nodesById.get(
      edge.from
    );

  const to =
    nodesById.get(
      edge.to
    );

  if (
    !from ||
    !to
  ) {
    return 0;
  }

  const relationship =
    normalize(
      edge.type
    );

  const fromLabel =
    normalize(
      from.label
    );

  const toLabel =
    normalize(
      to.label
    );

  let score =
    Math.max(
      0,
      edge.weight
    );

  for (
    const token of
    tokens
  ) {
    if (
      relationship.includes(
        token
      )
    ) {
      score += 5;
    }

    if (
      fromLabel.includes(
        token
      )
    ) {
      score += 3;
    }

    if (
      toLabel.includes(
        token
      )
    ) {
      score += 3;
    }
  }

  return score;
}

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
        edge.from ===
        nodeId
      ) {
        const node =
          graphStore.getNode(
            edge.to
          );

        if (
          node
        ) {
          neighbors.set(
            node.id,
            node
          );
        }
      }

      if (
        edge.to ===
        nodeId
      ) {
        const node =
          graphStore.getNode(
            edge.from
          );

        if (
          node
        ) {
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
          edge.from ===
            nodeId ||
          edge.to ===
            nodeId
      );
  }

  findByType(
    type: GraphNode["type"]
  ): GraphNode[] {
    return graphStore
      .getNodes()
      .filter(
        (node) =>
          node.type ===
          type
      );
  }

  search(
    query: string
  ): GraphNode[] {
    const normalized =
      normalize(
        query
      );

    if (
      !normalized
    ) {
      return [];
    }

    return graphStore
      .getNodes()
      .filter(
        (node) => {
          return (
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
      );
  }

  hasRelationship(
    from: string,
    to: string
  ): boolean {
    return graphStore
      .getEdges()
      .some(
        (edge) =>
          edge.from ===
            from &&
          edge.to ===
            to
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

  /**
   * Retrieve a request-relevant graph subgraph.
   *
   * Selection is performed entirely inside the graph query
   * layer so BrainState, Context and future consumers do not
   * need to duplicate graph traversal logic.
   *
   * The traversal is bounded by maxNodes and maxDepth so a
   * large graph cannot flood the cognitive context.
   */
  getRelevantSubgraph(
    query: string,
    options:
      RelevantGraphOptions = {}
  ): RelevantGraphSubgraph {
    const maxNodes =
      Math.max(
        1,
        options.maxNodes ??
          DEFAULT_MAX_NODES
      );

    const maxDepth =
      Math.max(
        0,
        options.maxDepth ??
          DEFAULT_MAX_DEPTH
      );

    const minTokenLength =
      Math.max(
        1,
        options.minTokenLength ??
          MIN_QUERY_TOKEN_LENGTH
      );

    const tokens =
      getQueryTokens(
        query,
        minTokenLength
      );

    if (
      tokens.length === 0
    ) {
      return {
        nodes: [],
        edges: [],
      };
    }

    const allNodes =
      graphStore.getNodes();

    const allEdges =
      graphStore.getEdges();

    const nodesById =
      new Map<
        string,
        GraphNode
      >(
        allNodes.map(
          (node) => [
            node.id,
            node,
          ]
        )
      );

    const nodeScores =
      new Map<
        string,
        number
      >();

    const selectedDepth =
      new Map<
        string,
        number
      >();

    const matchedNodes =
      new Set<string>();

    /*
    |--------------------------------------------------------------------------
    | Direct request matches
    |--------------------------------------------------------------------------
    */

    for (
      const node of
      allNodes
    ) {
      const score =
        scoreNode(
          node,
          tokens
        );

      if (
        score <= 0
      ) {
        continue;
      }

      matchedNodes.add(
        node.id
      );

      nodeScores.set(
        node.id,
        score
      );

      selectedDepth.set(
        node.id,
        0
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Empty-match fallback
    |--------------------------------------------------------------------------
    |
    | General conversation should still receive useful graph
    | context when no entity is explicitly mentioned.
    |
    | Rank graph nodes by weighted connectivity rather than
    | insertion order.
    |
    */

    if (
      matchedNodes.size ===
      0
    ) {
      const connectivity =
        new Map<
          string,
          number
        >();

      for (
        const edge of
        allEdges
      ) {
        const weight =
          Math.max(
            0,
            edge.weight
          );

        connectivity.set(
          edge.from,
          (
            connectivity.get(
              edge.from
            ) ?? 0
          ) + weight
        );

        connectivity.set(
          edge.to,
          (
            connectivity.get(
              edge.to
            ) ?? 0
          ) + weight
        );
      }

      const fallback =
        allNodes
          .map(
            (node) => ({
              node,

              score:
                (
                  connectivity.get(
                    node.id
                  ) ?? 0
                ) *
                FALLBACK_NODE_SCORE_FACTOR,
            })
          )
          .filter(
            (item) =>
              item.score > 0
          )
          .sort(
            (left, right) => {
              if (
                right.score !==
                left.score
              ) {
                return (
                  right.score -
                  left.score
                );
              }

              return left.node.id.localeCompare(
                right.node.id
              );
            }
          )
          .slice(
            0,
            maxNodes
          );

      for (
        const item of
        fallback
      ) {
        matchedNodes.add(
          item.node.id
        );

        nodeScores.set(
          item.node.id,
          item.score
        );

        selectedDepth.set(
          item.node.id,
          0
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Bounded relationship traversal
    |--------------------------------------------------------------------------
    |
    | Traverse outward from the matched seeds.
    |
    | Relationship weight affects inherited relevance.
    | Stronger relationships therefore outrank weak
    | peripheral connections.
    |
    */

    let frontier =
      [
        ...matchedNodes,
      ];

    for (
      let depth = 1;
      depth <= maxDepth;
      depth += 1
    ) {
      if (
        frontier.length ===
        0
      ) {
        break;
      }

      const nextFrontier =
        new Set<string>();

      for (
        const nodeId of
        frontier
      ) {
        const seedScore =
          nodeScores.get(
            nodeId
          ) ?? 0;

        const relationships =
          allEdges.filter(
            (edge) =>
              edge.from ===
                nodeId ||
              edge.to ===
                nodeId
          );

        for (
          const edge of
          relationships
        ) {
          const relatedId =
            edge.from ===
            nodeId
              ? edge.to
              : edge.from;

          const relatedNode =
            nodesById.get(
              relatedId
            );

          if (
            !relatedNode
          ) {
            continue;
          }

          const relationshipWeight =
            Math.max(
              0,
              edge.weight
            );

          const inheritedScore =
            seedScore *
            relationshipWeight *
            Math.pow(
              RELATED_NODE_SCORE_FACTOR,
              depth
            );

          const existingScore =
            nodeScores.get(
              relatedId
            ) ?? 0;

          if (
            inheritedScore >
            existingScore
          ) {
            nodeScores.set(
              relatedId,
              inheritedScore
            );
          }

          const previousDepth =
            selectedDepth.get(
              relatedId
            );

          if (
            previousDepth ===
              undefined ||
            depth <
              previousDepth
          ) {
            selectedDepth.set(
              relatedId,
              depth
            );
          }

          if (
            !matchedNodes.has(
              relatedId
            )
          ) {
            matchedNodes.add(
              relatedId
            );

            nextFrontier.add(
              relatedId
            );
          }
        }
      }

      frontier = [
        ...nextFrontier,
      ];
    }

    /*
    |--------------------------------------------------------------------------
    | Final node ranking
    |--------------------------------------------------------------------------
    */

    const nodes =
      [
        ...matchedNodes,
      ]
        .map(
          (id) => {
            const node =
              nodesById.get(
                id
              );

            return {
              node,
              score:
                nodeScores.get(
                  id
                ) ?? 0,
              depth:
                selectedDepth.get(
                  id
                ) ?? 0,
            };
          }
        )
        .filter(
          (
            item
          ): item is {
            node: GraphNode;
            score: number;
            depth: number;
          } =>
            Boolean(
              item.node
            )
        )
        .sort(
          (
            left,
            right
          ) => {
            if (
              right.score !==
              left.score
            ) {
              return (
                right.score -
                left.score
              );
            }

            if (
              left.depth !==
              right.depth
            ) {
              return (
                left.depth -
                right.depth
              );
            }

            return left.node.id.localeCompare(
              right.node.id
            );
          }
        )
        .slice(
          0,
          maxNodes
        )
        .map(
          (item) =>
            item.node
        );

    const selectedIds =
      new Set(
        nodes.map(
          (node) =>
            node.id
        )
      );

    /*
    |--------------------------------------------------------------------------
    | Final edge selection
    |--------------------------------------------------------------------------
    |
    | Only relationships inside the selected subgraph are
    | returned. This guarantees that BrainState receives a
    | coherent graph rather than disconnected global edges.
    |
    */

    const edges =
      allEdges
        .filter(
          (edge) =>
            selectedIds.has(
              edge.from
            ) &&
            selectedIds.has(
              edge.to
            )
        )
        .map(
          (edge) => ({
            edge,

            score:
              scoreEdge(
                edge,
                nodesById,
                tokens
              ),
          })
        )
        .sort(
          (
            left,
            right
          ) => {
            if (
              right.score !==
              left.score
            ) {
              return (
                right.score -
                left.score
              );
            }

            return left.edge.id.localeCompare(
              right.edge.id
            );
          }
        )
        .map(
          (item) =>
            item.edge
        );

    return {
      nodes,
      edges,
    };
  }
}

export const graphQuery =
  new GraphQuery();