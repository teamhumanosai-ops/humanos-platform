import { BaseStage } from "./baseStage";

import {
  BrainState,
} from "../../brainState";

import {
  retrieveKnowledgeResults,
} from "../../knowledge";

import {
  graphQuery,
} from "../../graph";

import {
  GraphNode,
  GraphEdge,
} from "../../graph";

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

function buildGraphContext(
  query: string
): {
  nodes: GraphNode[];
  edges: GraphEdge[];
} {
  const normalized =
    query
      .trim()
      .toLowerCase();

  if (!normalized) {
    return {
      nodes: [],
      edges: [],
    };
  }

  const terms =
    normalized
      .split(/\s+/)
      .map(
        (term) =>
          term.replace(
            /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu,
            ""
          )
      )
      .filter(
        (term) =>
          term.length >= 2
      );

  const matchedNodes =
    new Map<
      string,
      GraphNode
    >();

  const exactMatches =
    graphQuery.search(
      normalized
    );

  for (
    const node of exactMatches
  ) {
    matchedNodes.set(
      node.id,
      node
    );
  }

  for (
    const term of terms
  ) {
    const matches =
      graphQuery.search(
        term
      );

    for (
      const node of matches
    ) {
      matchedNodes.set(
        node.id,
        node
      );
    }
  }

  if (
    matchedNodes.size === 0
  ) {
    return {
      nodes: [],
      edges: [],
    };
  }

  const relevantNodes =
    new Map<
      string,
      GraphNode
    >(
      matchedNodes
    );

  const relevantEdges =
    new Map<
      string,
      GraphEdge
    >();

  for (
    const node of
      matchedNodes.values()
  ) {
    const subgraph =
      graphQuery.getConnectedSubgraph(
        node.id
      );

    for (
      const neighbor of
        subgraph.neighbors
    ) {
      relevantNodes.set(
        neighbor.id,
        neighbor
      );
    }

    for (
      const relationship of
        subgraph.relationships
    ) {
      relevantEdges.set(
        relationship.id,
        relationship
      );
    }
  }

  return {
    nodes: [
      ...relevantNodes.values(),
    ],

    edges: [
      ...relevantEdges.values(),
    ],
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
    | Knowledge retrieval is part of the canonical BrainState hydration
    | process. The retrieval subsystem remains responsible for search;
    | BrainState becomes the shared runtime representation.
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
    | Knowledge Graph
    |--------------------------------------------------------------------------
    |
    | Graph retrieval is request-aware.
    |
    | We first identify graph entities related to the user's request,
    | then use the canonical GraphQuery traversal API to collect their
    | connected relationships.
    |
    | BrainState remains the only shared cognitive artifact.
    |
    */

    const graphContext =
      buildGraphContext(
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

    if (state.profile) {
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