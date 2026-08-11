import {
  BrainState,
} from "../../brainState";

import {
  Intent,
} from "../../intent";

import {
  createGoalFromPlan,
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
 * The Planning Engine remains responsible
 * for plan generation.
 *
 * This stage additionally promotes the
 * generated plan into structured Goal
 * Intelligence inside BrainState.
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

    const plan =
      createPlanFromMessage(
        state.userMessage
      );

    if (!plan) {
      return state;
    }

    const goal =
      createGoalFromPlan(
        plan
      );

    state.goal =
      goal;

    state.currentGoal =
      goal.statement;

    state.currentPlanId =
      plan.id;

    state.plan =
      [
        `Plan: ${plan.title}`,

        `Goal: ${goal.statement}`,

        `Goal Status: ${goal.status}`,

        `Progress: ${goal.progress}%`,

        `Description: ${plan.description}`,

        `Next Action: ${goal.nextAction}`,

        `Priority: ${goal.priority}`,

        `Confidence: ${goal.confidence}`,

        `Obstacles: ${
          goal.obstacles.length > 0
            ? goal.obstacles.join(
                "; "
              )
            : "None identified"
        }`,

        `Dependencies: ${
          goal.dependencies.length > 0
            ? goal.dependencies.join(
                "; "
              )
            : "None identified"
        }`,

        "Milestones:",

        ...plan.milestones.map(
          (
            milestone,
            index
          ) =>
            `${index + 1}. ${milestone}`
        ),
      ].join("\n");

    return state;
  }
}