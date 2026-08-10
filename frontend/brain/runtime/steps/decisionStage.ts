import {
  BrainState,
} from "../../brainState";

import {
  getBestDecision,
} from "../../decision";

import {
  getPlan,
} from "../../planning";

import {
  BaseStage,
} from "./baseStage";

/**
 * DecisionStage
 *
 * Integrates the existing Decision Engine
 * into the Cognitive Runtime.
 *
 * The Decision Engine remains authoritative
 * for selecting the action.
 *
 * BrainState reasoning evidence is preserved
 * alongside the resulting decision so later
 * runtime stages can understand the cognitive
 * evidence that preceded the decision.
 */
export class DecisionStage
  extends BaseStage {
  readonly name =
    "Decision";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /*
    |--------------------------------------------------------------------------
    | A local skill response does not require
    | decision generation.
    |--------------------------------------------------------------------------
    */

    if (
      state.response
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Decision requires an active plan.
    |--------------------------------------------------------------------------
    */

    if (
      !state.currentPlanId
    ) {
      return state;
    }

    const plan =
      getPlan(
        state.currentPlanId
      );

    if (!plan) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Existing Decision Engine
    |--------------------------------------------------------------------------
    |
    | The engine remains responsible for selecting
    | the best action from the current plan.
    |
    */

    const decision =
      getBestDecision(
        plan
      );

    state.currentDecisionId =
      decision.id;

    /*
    |--------------------------------------------------------------------------
    | Structured reasoning evidence
    |--------------------------------------------------------------------------
    |
    | Preserve the reasoning signals that were
    | available before the decision was created.
    |
    */

    const reasoningEvidence =
      state.reasoningObservations
        .map(
          (
            observation,
            index
          ) =>
            `${index + 1}. [${
              observation.source
            }] ${
              observation.statement
            } (confidence ${
              observation.confidence.toFixed(
                2
              )
            })`
        );

    /*
    |--------------------------------------------------------------------------
    | Decision artifact
    |--------------------------------------------------------------------------
    */

    state.decision =
      [
        `Decision: ${decision.title}`,

        `Description: ${decision.description}`,

        `Selected Action: ${decision.selectedAction}`,

        "Alternatives:",

        ...decision.alternatives.map(
          (
            alternative,
            index
          ) =>
            `${index + 1}. ${alternative}`
        ),

        `Reason: ${decision.reason}`,

        `Confidence: ${decision.confidence}`,

        ...(reasoningEvidence.length > 0
          ? [
              "",

              "Reasoning Evidence:",

              ...reasoningEvidence,
            ]
          : []),

        ...(state.reasoningConfidence > 0
          ? [
              "",

              `Overall Reasoning Confidence: ${state.reasoningConfidence.toFixed(
                2
              )}`,
            ]
          : []),
      ].join("\n");

    return state;
  }
}