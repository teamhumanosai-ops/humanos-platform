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

  const tokens =
    getQueryTokens(
      userMessage
    );

  /*
  |--------------------------------------------------------------------------
  | Direct graph matches
  |--------------------------------------------------------------------------
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
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Relationship expansion
  |--------------------------------------------------------------------------
  |
  | Once a relevant entity is found, include
  | its immediate graph neighborhood. This gives
  | reasoning access to the relationship rather
  | than only the matched label.
  |
  */

  const seedNodes = [
    ...matchedNodes.values(),
  ];

  for (
    const node of seedNodes
  ) {
    for (
      const relatedNode of
      graphQuery.getRelatedNodes(
        node.id
      )
    ) {
      matchedNodes.set(
        relatedNode.id,
        relatedNode
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
  | exists. Limit the fallback to avoid injecting
  | the entire graph into every prompt.
  |
  */

  if (
    matchedNodes.size === 0
  ) {
    for (
      const node of
      graphQuery.getNodes()
        .slice(
          0,
          MAX_GRAPH_NODES
        )
    ) {
      matchedNodes.set(
        node.id,
        node
      );
    }
  }

  const nodes =
    [
      ...matchedNodes.values(),
    ].slice(
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
    | Hydrate only the graph information relevant
    | to the current request plus its immediate
    | relationship neighborhood.
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