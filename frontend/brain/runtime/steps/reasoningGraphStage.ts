import {
  BrainState,
} from "../../brainState";

import {
  brainStateGraphAdapter,
} from "../../graph";

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
 * This stage preserves that relevance boundary and uses the
 * BrainStateGraphAdapter as the canonical Graph -> BrainState
 * translation boundary.
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
      brainStateGraphAdapter.clear(
        state
      );

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
    | If upstream BrainState hydration did not provide
    | relationships, derive them from the graph query layer
    | while still enforcing the current BrainState relevance
    | boundary.
    |
    */

    const graphEdges =
      existingRelevantEdges.length ===
      0
        ? graphQuery
            .getEdges()
            .filter(
              (edge) =>
                relevantNodeIds.has(
                  edge.from
                ) &&
                relevantNodeIds.has(
                  edge.to
                )
            )
        : existingRelevantEdges;

    /*
    |--------------------------------------------------------------------------
    | Canonical Graph -> BrainState translation
    |--------------------------------------------------------------------------
    |
    | The adapter receives the already-selected graph context.
    | This prevents the adapter from accidentally replacing
    | request-aware BrainState data with the global graph.
    |
    */

    brainStateGraphAdapter.hydrate(
      state,
      {
        nodes:
          state.graph,

        edges:
          graphEdges,
      }
    );

    return state;
  }
}