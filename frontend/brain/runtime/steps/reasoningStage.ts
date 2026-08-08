import { BrainState } from "../../brainState";

import {
  reason,
} from "../../reasoning";

import {
  BaseStage,
} from "./baseStage";

/**
 * ReasoningStage
 *
 * Converts the cognitive information already
 * assembled in BrainState into structured
 * reasoning signals for the response layer.
 *
 * Reasoning is intentionally kept inside the
 * runtime. The reasoning engine does not own
 * BrainState; it only evaluates it.
 */
export class ReasoningStage
  extends BaseStage {
  readonly name = "Reasoning";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /**
     * If a previous stage has already produced
     * a final response, there is nothing left
     * to reason about for this execution.
     */
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