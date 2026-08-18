import {
  BrainState,
} from "../../brainState";

import {
  applyContentEvidenceQuality,
} from "../../contentIntelligence";

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
 *
 * Live-web reasoning is additionally weighted
 * by the canonical Content Intelligence evidence
 * quality signal before it is persisted.
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

    const observations =
      applyContentEvidenceQuality(
        result.observations,
        state.contentIntelligence
      );

    const confidence =
      observations.length === 0
        ? result.confidence
        : observations.reduce(
            (
              total,
              observation
            ) =>
              total +
              observation.confidence *
                observation.relevance,
            0
          ) /
          observations.reduce(
            (
              total,
              observation
            ) =>
              total +
              observation.relevance,
            0
          );

    /*
    |--------------------------------------------------------------------------
    | Preserve the structured reasoning artifact.
    |--------------------------------------------------------------------------
    */

    state.reasoningObservations =
      observations;

    state.reasoningConfidence =
      confidence;

    /*
    |--------------------------------------------------------------------------
    | Preserve the human-readable reasoning
    | representation for downstream response use.
    |--------------------------------------------------------------------------
    */

    state.reasoning =
      [
        result.summary,

        ...observations.map(
          (observation) =>
            `- ${observation.statement} [${observation.kind}] Source: ${observation.source} Confidence: ${observation.confidence.toFixed(
              2
            )}`
        ),

        `Overall reasoning confidence: ${confidence.toFixed(
          2
        )}`,
      ].join("\n");

    return state;
  }
}
