import {
  BrainState,
} from "../../brainState";

import {
  Intent,
} from "../../intent";

import {
  createPlanFromMessage,
  findRelevantActivePlan,
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
 * - Resume a relevant persisted plan when
 *   the user explicitly asks to continue it
 * - Create a new plan when planning is requested
 * - Store the resulting plan in BrainState
 *
 * The Planning Engine remains responsible
 * for plan generation and persistence.
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

    if (
      state.intent !==
      Intent.STARTUP_PLANNING
    ) {
      return state;
    }

    const message =
      state.userMessage.trim();

    const continuationRequested =
      /\b(continue|resume|next\s+step|next\s+action|keep\s+going|make\s+progress|progress|pick\s+up|update)\b/i.test(
        message
      );

    const plan =
      continuationRequested
        ? findRelevantActivePlan(
            message
          )
        : createPlanFromMessage(
            message
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

        "Completed Milestones:",

        ...(plan.completedMilestones.length > 0
          ? plan.completedMilestones.map(
              (
                milestone,
                index
              ) =>
                `${index + 1}. ${milestone}`
            )
          : [
              "None",
            ]),
      ].join(
        "\n"
      );

    return state;
  }
}