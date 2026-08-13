import {
  BrainState,
} from "../../brainState";

import {
  graphQuery,
} from "../../graph";

import {
  BaseStage,
} from "./baseStage";

/**
 * ReasoningGraphStage
 *
 * Keeps Knowledge Graph relationships aligned with the
 * graph nodes already selected for the current BrainState.
 *
 * BrainStateStage is responsible for selecting the relevant
 * graph nodes and relationships for the current request.
 *
 * This stage therefore preserves that relevance boundary
 * while ensuring the graph relationship data is available
 * to downstream reasoning.
 */
export class ReasoningGraphStage
  extends BaseStage {
  readonly name =
    "ReasoningGraph";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /*
    |--------------------------------------------------------------------------
    | No graph context
    |--------------------------------------------------------------------------
    */

    if (
      state.graph.length === 0
    ) {
      state.graphEdges = [];

      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Preserve relevant graph relationships
    |--------------------------------------------------------------------------
    |
    | BrainStateStage already selected the relevant graph
    | relationships for the current request.
    |
    | Do not replace that filtered set with every relationship
    | stored in the global graph.
    |
    */

    const relevantNodeIds =
      new Set(
        state.graph.map(
          (node) =>
            node.id
        )
      );

    const existingRelevantEdges =
      state.graphEdges.filter(
        (edge) =>
          relevantNodeIds.has(
            edge.from
          ) &&
          relevantNodeIds.has(
            edge.to
          )
      );

    /*
    |--------------------------------------------------------------------------
    | Fallback
    |--------------------------------------------------------------------------
    |
    | If the upstream BrainState hydration did not provide
    | relationships, derive them from the graph query layer
    | but still enforce the current BrainState relevance boundary.
    |
    */

    if (
      existingRelevantEdges.length === 0
    ) {
      state.graphEdges =
        graphQuery
          .getEdges()
          .filter(
            (edge) =>
              relevantNodeIds.has(
                edge.from
              ) &&
              relevantNodeIds.has(
                edge.to
              )
          );
    } else {
      state.graphEdges =
        existingRelevantEdges;
    }

    return state;
  }
}