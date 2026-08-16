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
 * Planning is activated for:
 *
 * - Explicit planning requests
 * - Startup planning
 * - Actionable task-management requests
 *
 * TASK_MANAGEMENT does not automatically mean
 * that a task capability exists. The existing
 * Planning Engine must still be able to extract
 * a real goal before a plan is created.
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
    | Task capability boundary
    |--------------------------------------------------------------------------
    |
    | TASK_MANAGEMENT is allowed to use the existing
    | Planning Engine only when the message expresses
    | an actionable goal that the existing goal
    | extractor understands.
    |
    | This prevents informational task requests such
    | as "show me my tasks" from creating fabricated
    | plans.
    |
    */

    if (
      taskIntent &&
      !hasActionableTaskGoal(
        state.userMessage
      )
    ) {
      return state;
    }

    const plan =
      createPlanFromMessage(
        state.userMessage
      );

    if (
      !plan
    ) {
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

/*
|--------------------------------------------------------------------------
| Actionable task detection
|--------------------------------------------------------------------------
*/

function hasActionableTaskGoal(
  message: string
): boolean {
  const text =
    message
      .trim()
      .toLowerCase();

  const actionablePatterns = [
    /\bi want to\b/,
    /\bi need to\b/,
    /\bhelp me\b/,
    /\bi'm trying to\b/,
    /\bim trying to\b/,
    /\bmy goal is\b/,
    /\bfinish\b/,
    /\bcomplete\b/,
    /\bdo\b/,
    /\bget\b/,
    /\bprepare\b/,
    /\borganize\b/,
    /\borganise\b/,
    /\bhandle\b/,
    /\bwork on\b/,
  ];

  return actionablePatterns.some(
    (
      pattern
    ) =>
      pattern.test(
        text
      )
  );
}