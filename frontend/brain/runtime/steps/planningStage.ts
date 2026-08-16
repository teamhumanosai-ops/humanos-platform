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
 * Planning is capability-based rather than
 * domain-specific.
 *
 * The same Planning Engine can serve:
 *
 * - startup goals
 * - work goals
 * - personal goals
 * - learning goals
 * - household goals
 * - financial goals
 * - health goals
 * - project goals
 * - actionable task requests
 *
 * TASK_MANAGEMENT only creates a plan when
 * the Planning Engine can extract an actionable
 * goal from the user's message.
 *
 * Informational requests such as:
 *
 * "Show me my tasks"
 *
 * therefore do not fabricate a plan.
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

    const taskIntent =
      state.intent ===
      Intent.TASK_MANAGEMENT;

    if (
      !planningIntent &&
      !taskIntent
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | One Planning Engine
    |--------------------------------------------------------------------------
    |
    | Both explicit planning and actionable task
    | requests use exactly the same Planning Engine.
    |
    */

    const plan =
      createPlanFromMessage(
        state.userMessage
      );

    /*
    |--------------------------------------------------------------------------
    | No actionable goal
    |--------------------------------------------------------------------------
    |
    | This is expected for informational requests
    | such as "Show me my tasks".
    |
    | Do not fabricate a plan.
    |
    */

    if (
      !plan
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | BrainState integration
    |--------------------------------------------------------------------------
    */

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