import {
  BrainState,
} from "../../brainState";

import {
  predict,
} from "../../prediction";

import {
  BaseStage,
} from "./baseStage";

/**
 * PredictionStage
 *
 * Integrates the existing Prediction Engine
 * into the Cognitive Runtime.
 *
 * Prediction consumes the cognitive information
 * already hydrated into BrainState and stores
 * structured predictions back into BrainState.
 */
export class PredictionStage
  extends BaseStage {
  readonly name =
    "Prediction";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    state.predictions =
      predict(
        state
      );

    return state;
  }
}