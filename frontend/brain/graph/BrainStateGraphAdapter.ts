import type {
  BrainState,
} from "../brainState";

import {
  graphQuery,
} from "./GraphQuery";

/**
 * BrainStateGraphAdapter
 *
 * Owns the translation between the Knowledge Graph
 * and the shared Cognitive BrainState.
 *
 * The graph remains responsible for storage and query
 * semantics. BrainState remains responsible for the
 * current cognitive execution state.
 */
export class BrainStateGraphAdapter {
  hydrate(
    state: BrainState
  ): BrainState {
    state.graph =
      graphQuery.getNodes();

    state.graphEdges =
      graphQuery.getEdges();

    return state;
  }

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