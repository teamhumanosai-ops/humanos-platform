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
 * Integrates the existing Knowledge Graph
 * relationships into the runtime BrainState.
 *
 * BrainStateStage already hydrates graph nodes.
 * This stage adds the graph relationships so
 * downstream reasoning can use both nodes and
 * edges from the same cognitive artifact.
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
    | Graph nodes are already hydrated by BrainStateStage.
    |--------------------------------------------------------------------------
    */

    if (
      state.graph.length === 0
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Hydrate graph relationships into BrainState.
    |--------------------------------------------------------------------------
    |
    | Reasoning already consumes state.graphEdges.
    | The stage therefore does not create another
    | graph context object or mutate state.context.
    |
    */

    state.graphEdges =
      graphQuery.getEdges();

    return state;
  }
}