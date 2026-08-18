import type {
  BrainState,
} from "../brainState";

import type {
  GraphEdge,
  GraphNode,
} from "./types";

import {
  graphQuery,
} from "./GraphQuery";

/**
 * Graph context selected for the current cognitive request.
 *
 * The graph subsystem owns graph storage and query semantics.
 * BrainState owns the selected runtime representation.
 */
export type BrainStateGraphContext = {
  nodes: GraphNode[];

  edges: GraphEdge[];
};

/**
 * BrainStateGraphAdapter
 *
 * Owns the translation between the Knowledge Graph
 * and the shared Cognitive BrainState.
 *
 * The adapter intentionally accepts an already-selected
 * graph context so request-aware relevance decisions remain
 * owned by the upstream graph/context selection layer.
 */
export class BrainStateGraphAdapter {
  /**
   * Hydrate BrainState with a graph context.
   *
   * When an explicit context is supplied, preserve that
   * request-scoped selection exactly.
   *
   * The global graph fallback exists for callers that need
   * a complete graph snapshot outside request-aware runtime
   * hydration.
   */
  hydrate(
    state: BrainState,
    context?: BrainStateGraphContext
  ): BrainState {
    if (context) {
      state.graph =
        [...context.nodes];

      state.graphEdges =
        [...context.edges];

      return state;
    }

    state.graph =
      graphQuery.getNodes();

    state.graphEdges =
      graphQuery.getEdges();

    return state;
  }

  /**
   * Clear graph information from BrainState.
   */
  clear(
    state: BrainState
  ): BrainState {
    state.graph = [];

    state.graphEdges = [];

    return state;
  }
}

export const brainStateGraphAdapter =
  new BrainStateGraphAdapter();