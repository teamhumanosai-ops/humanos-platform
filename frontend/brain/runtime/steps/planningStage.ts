import {
  BrainState,
} from "../../brainState";

import {
  Intent,
} from "../../intent";

import {
  createPlanFromMessage,
  getAllPlans,
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
 *
 * - Handle explicit planning requests
 * - Handle startup planning
 * - Handle actionable task-management requests
 * - Return persisted planning results for task queries
 * - Prevent informational task queries from
 *   falling through to an LLM-generated/fabricated
 *   task list
 *
 * The Planning Engine remains responsible for:
 *
 * - Goal extraction
 * - Plan generation
 * - Plan storage
 * - Plan retrieval
 * - Plan updates
 * - Plan deletion
 * - Milestone completion
 *
 * BrainState remains the shared cognitive state.
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

    const isPlanningRequest =
      state.intent ===
        Intent.STARTUP_PLANNING ||
      state.intent ===
        Intent.PLANNING;

    const isTaskRequest =
      state.intent ===
      Intent.TASK_MANAGEMENT;

    if (
      !isPlanningRequest &&
      !isTaskRequest
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Informational task request
    |--------------------------------------------------------------------------
    |
    | Examples:
    |
    | "Show me my tasks"
    | "List my tasks"
    | "What tasks do I have?"
    |
    | These requests must use the real Planning Engine
    | instead of allowing the language model to invent
    | a task list.
    |
    */

    if (
      isTaskRequest &&
      !this.hasActionableGoal(
        state.userMessage
      )
    ) {
      return this.populateTaskListResponse(
        state
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Create actual plan
    |--------------------------------------------------------------------------
    |
    | Planning and actionable task requests both use
    | exactly the same Planning Engine.
    |
    */

    const plan =
      createPlanFromMessage(
        state.userMessage
      );

    if (
      !plan
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | BrainState synchronization
    |--------------------------------------------------------------------------
    */

    state.currentGoal =
      plan.goal;

    state.currentPlanId =
      plan.id;

    state.plan =
      this.formatPlan(
        plan
      );

    /*
    |--------------------------------------------------------------------------
    | Task-management response
    |--------------------------------------------------------------------------
    |
    | For actionable TASK_MANAGEMENT requests we
    | return the actual generated Plan instead of
    | allowing ResponseStage to replace it with
    | generic LLM conversation.
    |
    */

    if (
      isTaskRequest
    ) {
      state.response =
        [
          "Task added to your planner.",

          "",

          this.formatPlan(
            plan
          ),
        ].join(
          "\n"
        );
    }

    return state;
  }

  /*
  |--------------------------------------------------------------------------
  | Actionable goal detection
  |--------------------------------------------------------------------------
  |
  | This is intentionally broad because the Planning
  | Engine is generic and must support goals across
  | different life domains.
  |
  */

  private hasActionableGoal(
    message: string
  ): boolean {
    const text =
      message
        .trim()
        .toLowerCase();

    if (
      !text
    ) {
      return false;
    }

    const informationalPatterns = [
      /^show me\b/,
      /^show my\b/,
      /^list\b/,
      /^what are my\b/,
      /^what tasks do i have\b/,
      /^what do i need to do\b/,
      /^what should i do\b/,
    ];

    if (
      informationalPatterns.some(
        (
          pattern
        ) =>
          pattern.test(
            text
          )
      )
    ) {
      return false;
    }

    const actionablePatterns = [
      /\bi want to\b/,
      /\bi need to\b/,
      /\bhelp me\b/,
      /\bi'm trying to\b/,
      /\bim trying to\b/,
      /\bmy goal is\b/,
      /\bi would like to\b/,
      /\bi'd like to\b/,
      /\bi plan to\b/,
      /\bfinish\b/,
      /\bcomplete\b/,
      /\bbuy\b/,
      /\bprepare\b/,
      /\borganize\b/,
      /\borganise\b/,
      /\bhandle\b/,
      /\breview\b/,
      /\bupdate\b/,
      /\bfix\b/,
      /\bclean\b/,
      /\bcall\b/,
      /\bsend\b/,
      /\bpay\b/,
      /\bstudy\b/,
      /\blearn\b/,
      /\bpractice\b/,
      /\bresearch\b/,
      /\bwrite\b/,
      /\bread\b/,
      /\bimplement\b/,
      /\bbuild\b/,
      /\bcreate\b/,
      /\bdevelop\b/,
      /\blaunch\b/,
      /\binstall\b/,
      /\bset up\b/,
      /\bsetup\b/,
      /\bwork on\b/,
      /\bget\b/,
      /\bdo\b/,
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

  /*
  |--------------------------------------------------------------------------
  | Real task list
  |--------------------------------------------------------------------------
  */

  private populateTaskListResponse(
    state: BrainState
  ): BrainState {
    const plans =
      getAllPlans();

    if (
      plans.length ===
      0
    ) {
      state.response =
        "You don't have any tasks in your planner yet.";

      return state;
    }

    const activePlans =
      plans.filter(
        (
          plan
        ) =>
          plan.status ===
          "active"
      );

    const visiblePlans =
      activePlans.length > 0
        ? activePlans
        : plans;

    state.response =
      [
        "Here are the tasks currently stored in your planner:",

        "",

        ...visiblePlans.map(
          (
            plan,
            index
          ) =>
            `${index + 1}. ${plan.goal} — Next action: ${plan.nextAction}`
        ),
      ].join(
        "\n"
      );

    return state;
  }

  /*
  |--------------------------------------------------------------------------
  | Plan formatting
  |--------------------------------------------------------------------------
  */

  private formatPlan(
    plan: {
      title: string;
      goal: string;
      description: string;
      nextAction: string;
      priority: number;
      confidence: number;
      milestones: string[];
    }
  ): string {
    return [
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
  }
}