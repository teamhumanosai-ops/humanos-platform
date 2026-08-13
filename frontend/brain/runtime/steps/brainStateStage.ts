import { BaseStage } from "./baseStage";

import {
  BrainState,
} from "../../brainState";

import {
  graphQuery,
} from "../../graph";

import {
  retrieveKnowledgeResults,
} from "../../knowledge";

import {
  profileEngine,
} from "../../profile/profileEngine";

import {
  buildTimelinePrompt,
} from "../../timeline";

import {
  buildReflectionPrompt,
} from "../../reflection";

import {
  enrichmentEngine,
} from "../../enrichment";

const MAX_GRAPH_NODES = 20;

const MIN_QUERY_TOKEN_LENGTH = 3;

const DIRECT_MATCH_SCORE = 3;

const PARTIAL_MATCH_SCORE = 1;

const RELATED_NODE_SCORE_FACTOR = 0.5;

const FALLBACK_NODE_SCORE_FACTOR = 0.1;

function getQueryTokens(
  message: string
): string[] {
  return [
    ...new Set(
      message
        .toLowerCase()
        .replace(
          /[^a-z0-9\s-_]/g,
          " "
        )
        .split(/\s+/)
        .map(
          (token) =>
            token.trim()
        )
        .filter(
          (token) =>
            token.length >=
            MIN_QUERY_TOKEN_LENGTH
        )
    ),
  ];
}

function getNodeMatchScore(
  node: BrainState["graph"][number],
  tokens: string[]
): number {
  const id =
    node.id.toLowerCase();

  const label =
    node.label.toLowerCase();

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

      return score;
    },
    0
  );
}

function hydrateRelevantGraph(
  userMessage: string
): {
  nodes: BrainState["graph"];
  edges: BrainState["graphEdges"];
} {
  const matchedNodes =
    new Map<
      string,
      BrainState["graph"][number]
    >();

  const nodeScores =
    new Map<
      string,
      number
    >();

  const tokens =
    getQueryTokens(
      userMessage
    );

  /*
  |--------------------------------------------------------------------------
  | Direct graph matches
  |--------------------------------------------------------------------------
  |
  | Direct matches receive the strongest relevance
  | score because the node itself matches terminology
  | from the current request.
  |
  */

  for (
    const token of tokens
  ) {
    for (
      const node of
      graphQuery.search(token)
    ) {
      matchedNodes.set(
        node.id,
        node
      );

      const score =
        getNodeMatchScore(
          node,
          tokens
        );

      nodeScores.set(
        node.id,
        Math.max(
          nodeScores.get(
            node.id
          ) ?? 0,
          score
        )
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Relationship expansion
  |--------------------------------------------------------------------------
  |
  | Related nodes inherit relevance from their matched
  | seed nodes. Existing relationship weights strengthen
  | or weaken that inherited relevance.
  |
  */

  const seedNodes = [
    ...matchedNodes.values(),
  ];

  for (
    const node of seedNodes
  ) {
    const seedScore =
      nodeScores.get(
        node.id
      ) ?? 0;

    const relationships =
      graphQuery.getRelationships(
        node.id
      );

    for (
      const edge of
      relationships
    ) {
      const relatedId =
        edge.from === node.id
          ? edge.to
          : edge.from;

      const relatedNode =
        graphQuery.getNode(
          relatedId
        );

      if (
        !relatedNode
      ) {
        continue;
      }

      matchedNodes.set(
        relatedNode.id,
        relatedNode
      );

      const relationshipWeight =
        Math.max(
          0,
          edge.weight
        );

      const inheritedScore =
        seedScore *
        relationshipWeight *
        RELATED_NODE_SCORE_FACTOR;

      nodeScores.set(
        relatedNode.id,
        Math.max(
          nodeScores.get(
            relatedNode.id
          ) ?? 0,
          inheritedScore
        )
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Empty-match fallback
  |--------------------------------------------------------------------------
  |
  | General conversation should still have access
  | to graph context when no direct entity match
  | exists.
  |
  | Instead of taking arbitrary insertion-order nodes,
  | rank fallback nodes by their weighted graph
  | connectivity so highly connected knowledge has
  | a better chance of entering BrainState.
  |
  */

  if (
    matchedNodes.size === 0
  ) {
    const fallbackScores =
      new Map<
        string,
        number
      >();

    for (
      const edge of
      graphQuery.getEdges()
    ) {
      const weight =
        Math.max(
          0,
          edge.weight
        );

      fallbackScores.set(
        edge.from,
        (
          fallbackScores.get(
            edge.from
          ) ?? 0
        ) +
          weight
      );

      fallbackScores.set(
        edge.to,
        (
          fallbackScores.get(
            edge.to
          ) ?? 0
        ) +
          weight
      );
    }

    const fallbackNodes =
      graphQuery
        .getNodes()
        .sort(
          (
            left,
            right
          ) => {
            const rightScore =
              fallbackScores.get(
                right.id
              ) ?? 0;

            const leftScore =
              fallbackScores.get(
                left.id
              ) ?? 0;

            return (
              rightScore -
              leftScore
            );
          }
        )
        .slice(
          0,
          MAX_GRAPH_NODES
        );

    for (
      const node of
      fallbackNodes
    ) {
      matchedNodes.set(
        node.id,
        node
      );

      nodeScores.set(
        node.id,
        (
          fallbackScores.get(
            node.id
          ) ?? 0
        ) *
          FALLBACK_NODE_SCORE_FACTOR
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Relevance ranking
  |--------------------------------------------------------------------------
  |
  | Direct matches and strongly connected related nodes
  | are now ordered before weaker graph context.
  |
  */

  const nodes =
    [
      ...matchedNodes.values(),
    ]
      .sort(
        (
          left,
          right
        ) => {
          const rightScore =
            nodeScores.get(
              right.id
            ) ?? 0;

          const leftScore =
            nodeScores.get(
              left.id
            ) ?? 0;

          if (
            rightScore !==
            leftScore
          ) {
            return (
              rightScore -
              leftScore
            );
          }

          return left.id.localeCompare(
            right.id
          );
        }
      )
      .slice(
        0,
        MAX_GRAPH_NODES
      );

  const nodeIds =
    new Set(
      nodes.map(
        (node) =>
          node.id
      )
    );

  /*
  |--------------------------------------------------------------------------
  | Relevant relationships
  |--------------------------------------------------------------------------
  |
  | Only relationships between retained nodes enter
  | BrainState. Stronger weighted relationships are
  | ordered first.
  |
  */

  const edges =
    graphQuery
      .getEdges()
      .filter(
        (edge) =>
          nodeIds.has(
            edge.from
          ) &&
          nodeIds.has(
            edge.to
          )
      )
      .sort(
        (
          left,
          right
        ) => {
          const rightWeight =
            Math.max(
              0,
              right.weight
            );

          const leftWeight =
            Math.max(
              0,
              left.weight
            );

          if (
            rightWeight !==
            leftWeight
          ) {
            return (
              rightWeight -
              leftWeight
            );
          }

          return left.id.localeCompare(
            right.id
          );
        }
      );

  return {
    nodes,
    edges,
  };
}

export class BrainStateStage
  extends BaseStage {
  readonly name =
    "BrainState";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /*
    |--------------------------------------------------------------------------
    | Knowledge Retrieval
    |--------------------------------------------------------------------------
    |
    | Knowledge retrieval remains responsible for
    | searching the knowledge base. BrainState stores
    | the structured retrieval results for downstream
    | cognitive stages.
    |
    */

    const knowledge =
      await retrieveKnowledgeResults(
        state.userMessage
      );

    state.knowledge =
      knowledge.map(
        (result) => ({
          source:
            result.source,

          text:
            result.text,

          score:
            result.score,
        })
      );

    /*
    |--------------------------------------------------------------------------
    | Reasoning Graph
    |--------------------------------------------------------------------------
    |
    | Hydrate graph information relevant to the current
    | request, rank it using direct matches and weighted
    | relationships, then retain the strongest context.
    |
    */

    const graphContext =
      hydrateRelevantGraph(
        state.userMessage
      );

    state.graph =
      graphContext.nodes;

    state.graphEdges =
      graphContext.edges;

    /*
    |--------------------------------------------------------------------------
    | Human Profile
    |--------------------------------------------------------------------------
    */

    state.profile =
      profileEngine.get();

    if (
      state.profile
    ) {
      const enrichmentSuggestion =
        enrichmentEngine.getNextQuestion(
          state.profile
        );

      console.debug(
        "[Human OS] Next enrichment:",
        enrichmentSuggestion
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Timeline
    |--------------------------------------------------------------------------
    */

    const timeline =
      await buildTimelinePrompt();

    state.timeline =
      timeline
        .split("\n")
        .map(
          (line) =>
            line.trim()
        )
        .filter(Boolean);

    /*
    |--------------------------------------------------------------------------
    | Reflections
    |--------------------------------------------------------------------------
    */

    const reflections =
      await buildReflectionPrompt();

    state.reflections =
      reflections
        .split("\n")
        .map(
          (line) =>
            line.trim()
        )
        .filter(Boolean);

    return state;
  }
}