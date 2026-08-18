import {
  BrainState,
} from "../../brainState";

import {
  GraphEdge,
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
 * Integrates the relevant Knowledge Graph relationships
 * into the runtime BrainState.
 *
 * BrainStateStage hydrates the graph nodes first.
 * This stage then derives only the relationships connected
 * to those hydrated nodes so downstream reasoning receives
 * graph evidence belonging to the current cognitive state.
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
    |
    | Keep the graph boundary explicit. If BrainState contains
    | no graph nodes, it should also contain no graph relationships.
    |
    */

    if (
      state.graph.length === 0
    ) {
      state.graphEdges = [];

      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Build the current BrainState graph boundary
    |--------------------------------------------------------------------------
    |
    | Only relationships whose endpoints are already present in
    | BrainState.graph are eligible for downstream reasoning.
    |
    */

    const graphNodeIds =
      new Set(
        state.graph.map(
          (node) =>
            node.id
        )
      );

    const relevantEdges =
      graphQuery
        .getEdges()
        .filter(
          (
            edge: GraphEdge
          ) =>
            graphNodeIds.has(
              edge.from
            ) &&
            graphNodeIds.has(
              edge.to
            )
        );

    /*
    |--------------------------------------------------------------------------
    | Preserve the shared BrainState contract
    |--------------------------------------------------------------------------
    |
    | Do not create another graph context object.
    | BrainState remains the single cognitive artifact.
    |
    */

    state.graphEdges =
      relevantEdges;

    return state;
  }
}