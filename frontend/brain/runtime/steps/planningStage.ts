import {
  BrainState,
} from "../../brainState";

import {
  Intent,
} from "../../intent";

import {
  createPlanFromMessage,
} from "../../planning";

import {
  BaseStage,
} from "./baseStage";

/**
 * PlanningStage
 *
 * Integrates the existing Planning Engine
 * into the Cognitive Runtime.
 *
 * Responsibilities:
 * - Determine whether the current request
 *   requires planning
 * - Create a plan using the existing
 *   Planning Engine
 * - Store the resulting plan in BrainState
 *
 * The Planning Engine remains responsible
 * for plan generation.
 *
 * BrainState remains the shared runtime
 * artifact.
 */
export class PlanningStage
  extends BaseStage {
  readonly name =
    "Planning";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (
      state.response
    ) {
      return state;
    }

    const planningIntent =
      state.intent ===
        Intent.STARTUP_PLANNING ||
      state.intent ===
        Intent.PLANNING;

    if (
      !planningIntent
    ) {
      return state;
    }

    const plan =
      createPlanFromMessage(
        state.userMessage
      );

    if (!plan) {
      return state;
    }

    state.currentGoal =
      plan.goal;

    state.currentPlanId =
      plan.id;

    state.plan =
      [
        `Plan: ${plan.title}`,

        `Goal: ${plan.goal}`,

        `Description: ${plan.description}`,

        `Next Action: ${plan.nextAction}`,

        `Priority: ${plan.priority}`,

        `Confidence: ${plan.confidence}`,

        "Milestones:",

        ...plan.milestones.map(
          (
            milestone,
            index
          ) =>
            `${index + 1}. ${milestone}`
        ),
      ].join(
        "\n"
      );

    return state;
  }
}