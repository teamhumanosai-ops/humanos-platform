import {
  BrainState,
} from "../../brainState";

import {
  infer,
} from "../../inference";

import {
  BaseStage,
} from "./baseStage";

/**
 * InferenceStage
 *
 * Converts structured reasoning evidence
 * into explicit cognitive inferences.
 *
 * The inference engine remains responsible
 * for inference generation.
 *
 * BrainState remains responsible for retaining
 * the structured inference artifact.
 */
export class InferenceStage
  extends BaseStage {
  readonly name =
    "Inference";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (
      state.response
    ) {
      return state;
    }

    state.inferences =
      infer(state);

    return state;
  }
}