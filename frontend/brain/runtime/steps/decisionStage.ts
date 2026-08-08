import { BrainState } from "../../brainState";

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
 * Responsibilities:
 * - Read the plan selected by PlanningStage
 * - Generate the best decision for that plan
 * - Store the decision in BrainState
 *
 * The Decision Engine remains responsible
 * for decision generation.
 *
 * BrainState remains the shared runtime artifact.
 */
export class DecisionStage
  extends BaseStage {
  readonly name = "Decision";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (state.response) {
      return state;
    }

    if (!state.currentPlanId) {
      return state;
    }

    const plan =
      getPlan(
        state.currentPlanId
      );

    if (!plan) {
      return state;
    }

    const decision =
      getBestDecision(
        plan
      );

    state.currentDecisionId =
      decision.id;

    state.decision =
      [
        `Decision: ${decision.title}`,

        `Description: ${decision.description}`,

        `Selected Action: ${decision.selectedAction}`,

        "Alternatives:",

        ...decision.alternatives.map(
          (alternative, index) =>
            `${index + 1}. ${alternative}`
        ),

        `Reason: ${decision.reason}`,

        `Confidence: ${decision.confidence}`,
      ].join("\n");

    return state;
  }
}