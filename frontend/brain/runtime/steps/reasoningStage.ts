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
 * reasoning signals.
 *
 * The reasoning engine remains responsible
 * for producing ReasoningResult.
 *
 * BrainState remains responsible for
 * retaining the structured runtime artifact.
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
    | If a previous stage has already produced
    | a final response, there is nothing left
    | to reason about for this execution.
    |--------------------------------------------------------------------------
    */

    if (
      state.response
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Evaluate the canonical BrainState.
    |--------------------------------------------------------------------------
    */

    const result =
      reason(state);

    /*
    |--------------------------------------------------------------------------
    | Preserve the structured reasoning artifact.
    |--------------------------------------------------------------------------
    |
    | This is the authoritative machine-readable
    | reasoning representation for downstream
    | runtime stages.
    |
    */

    state.reasoningObservations =
      result.observations;

    state.reasoningConfidence =
      result.confidence;

    /*
    |--------------------------------------------------------------------------
    | Preserve the human-readable reasoning
    | representation for compatibility with
    | existing downstream consumers.
    |--------------------------------------------------------------------------
    */

    state.reasoning =
      [
        result.summary,

        ...result.observations.map(
          (
            observation
          ) =>
            `- ${observation.statement} [${observation.source}] Confidence: ${observation.confidence.toFixed(
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