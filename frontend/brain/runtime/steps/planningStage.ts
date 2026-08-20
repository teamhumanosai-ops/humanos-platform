import {
  BrainState,
} from "../../brainState";

import {
  Intent,
} from "../../intent";

import {
  createGoalFromPlan,
  createPlanFromMessageWithContext,
  enrichGoalFromContext,
  getAllPlans,
  savePlan,
} from "../../planning";

import {
  getLifeDomain,
} from "../../lifeDomains";

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
 * - Preserve cognitive evidence when creating plans
 * - Build the canonical Goal artifact from the persisted Plan
 * - Preserve Life Domain context on user-owned plan artifacts
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
    | The complete BrainState cognitive evidence is
    | passed through the PlanningContext contract so
    | goal dependencies and obstacles can be derived
    | from the same state used by later stages.
    |
    */

    const plan =
      createPlanFromMessageWithContext(
        state.userMessage,
        {
          graphObservations:
            state.graph
              .slice(
                0,
                5
              )
              .map(
                (node) =>
                  `${node.label} (${node.type})`
              ),

          graphNodes:
            state.graph.map(
              (node) => ({
                id:
                  node.id,
                label:
                  node.label,
                type:
                  node.type,
              })
            ),

          graphEdges:
            state.graphEdges.map(
              (edge) => ({
                from:
                  edge.from,
                to:
                  edge.to,
                type:
                  edge.type,
              })
            ),

          reasoningObservations:
            state.reasoningObservations.map(
              (observation) => ({
                statement:
                  observation.statement,
                confidence:
                  observation.confidence,
                kind:
                  observation.kind,
              })
            ),

          timeline:
            state.timeline,

          reflections:
            state.reflections,

          memories:
            state.memories.map(
              (memory) =>
                `${memory.key}: ${memory.value}`
            ),
        }
      );

    if (
      !plan
    ) {
      return state;
    }

    /*
    |--------------------------------------------------------------------------
    | Life Domain planning context
    |--------------------------------------------------------------------------
    |
    | Life Domain detection remains request-scoped in BrainState.
    | When the request creates an actual user-owned plan, the
    | detected domain is preserved on that plan artifact so
    | downstream planning and decision stages reason from the
    | same cognitive signal. This does not write the domain to
    | the user's permanent profile or make it a user attribute.
    |--------------------------------------------------------------------------
    */

    if (
      state.primaryLifeDomain !==
      "general"
    ) {
      const domain =
        getLifeDomain(
          state.primaryLifeDomain
        );

      plan.description =
        [
          plan.description,

          `Life domain context: ${domain.id}, ${domain.label}`,

          `Domain guidance: ${domain.description}`,
        ].join("\n");

      savePlan(
        plan
      );
    }

    /*
    |--------------------------------------------------------------------------
    | BrainState synchronization
    |--------------------------------------------------------------------------
    */

    const goal =
      enrichGoalFromContext(
        createGoalFromPlan(
          plan
        ),
        {
          graphNodes:
            state.graph.map(
              (node) => ({
                id:
                  node.id,
                label:
                  node.label,
                type:
                  node.type,
              })
            ),

          graphEdges:
            state.graphEdges.map(
              (edge) => ({
                from:
                  edge.from,
                to:
                  edge.to,
                type:
                  edge.type,
              })
            ),

          reasoningObservations:
            state.reasoningObservations.map(
              (observation) => ({
                statement:
                  observation.statement,
                confidence:
                  observation.confidence,
                kind:
                  observation.kind,
              })
            ),

          timeline:
            state.timeline,

          reflections:
            state.reflections,

          memories:
            state.memories.map(
              (memory) =>
                `${memory.key}: ${memory.value}`
            ),
        }
      );

    state.goal =
      goal;

    state.currentGoal =
      goal.statement;

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

          "",

          this.formatGoal(
            goal
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

  private formatGoal(
    goal: {
      statement: string;
      status: string;
      progress: number;
      priority: number;
      confidence: number;
      nextAction: string;
      obstacles: string[];
      dependencies: string[];
    }
  ): string {
    return [
      "Goal Intelligence:",

      `Statement: ${goal.statement}`,

      `Status: ${goal.status}`,

      `Progress: ${goal.progress}%`,

      `Priority: ${goal.priority}`,

      `Confidence: ${goal.confidence}`,

      `Next Action: ${goal.nextAction}`,

      ...(goal.dependencies.length > 0
        ? [
            `Dependencies: ${goal.dependencies.join(
              ", "
            )}`,
          ]
        : []),

      ...(goal.obstacles.length > 0
        ? [
            `Obstacles: ${goal.obstacles.join(
              "; "
            )}`,
          ]
        : []),
    ].join(
      "\n"
    );
  }
}
