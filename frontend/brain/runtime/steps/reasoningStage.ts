import {
  BrainState,
} from "../../brainState";

import {
  reason,
} from "../../reasoning";

import {
  BaseStage,
} from "./baseStage";

export class ReasoningStage
  extends BaseStage {
  readonly name =
    "Reasoning";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (state.response) {
      return state;
    }

    const result =
      reason(state);

    state.reasoning =
      [
        result.summary,

        ...result.observations.map(
          (observation) =>
            `- ${observation.statement} Confidence: ${observation.confidence.toFixed(
              2
            )}`
        ),

        `Overall reasoning confidence: ${result.confidence.toFixed(
          2
        )}`,
      ].join("\n");

    return state;
  }
}