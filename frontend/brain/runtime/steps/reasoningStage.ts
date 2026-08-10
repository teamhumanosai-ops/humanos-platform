import {
  BrainState,
} from "../../brainState";

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
 * The reasoning engine produces both:
 *
 * - human-readable reasoning
 * - structured reasoning evidence
 *
 * BrainState stores both representations so
 * downstream Planning, Decision, Execution,
 * and future cognitive stages can consume the
 * structured evidence directly.
 */
export class ReasoningStage
  extends BaseStage {
  readonly name =
    "Reasoning";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /*
    |--------------------------------------------------------------------------
    | Stop if an earlier stage already produced
    | a final response.
    |--------------------------------------------------------------------------
    */

    if (state.response) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Generate structured reasoning
    |--------------------------------------------------------------------------
    */

    const result =
      reason(state);

    /*
    |--------------------------------------------------------------------------
    | Canonical structured evidence
    |--------------------------------------------------------------------------
    */

    state.reasoningObservations =
      result.observations;

    state.reasoningConfidence =
      result.confidence;

    /*
    |--------------------------------------------------------------------------
    | Human-readable reasoning representation
    |--------------------------------------------------------------------------
    */

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