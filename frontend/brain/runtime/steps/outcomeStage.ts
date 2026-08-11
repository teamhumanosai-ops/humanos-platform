import {
  BrainState,
  BrainRuntimeStatus,
} from "../../brainState";

import {
  getExecution,
  ExecutionStatus,
} from "../../execution";

import {
  createGoalFromPlan,
  enrichGoalFromContext,
  getPlan,
} from "../../planning";

import {
  createRuntimeOutcome,
} from "../outcome";

import {
  BaseStage,
} from "./baseStage";

/**
 * OutcomeStage
 *
 * Finalizes the cognitive runtime by synchronizing:
 *
 * - Execution state
 * - Plan progress
 * - Goal progress
 * - Runtime outcome
 * - Overall runtime status
 */
export class OutcomeStage
  extends BaseStage {
  readonly name =
    "Outcome";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    const execution =
      state.currentExecutionId
        ? getExecution(
            state.currentExecutionId
          )
        : undefined;

    const plan =
      state.currentPlanId
        ? getPlan(
            state.currentPlanId
          )
        : undefined;

    /*
    |--------------------------------------------------------------------------
    | Synchronize plan and goal information.
    |--------------------------------------------------------------------------
    |
    | Execution completion can update the underlying plan before OutcomeStage
    | runs. Rebuild the Goal from that current plan so BrainState reflects
    | the latest progress and next action.
    |
    */

    if (plan) {
      const initialGoal =
        createGoalFromPlan(
          plan
        );

      const goal =
        enrichGoalFromContext(
          initialGoal,
          {
            graphObservations:
              [],

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
              state.reasoningObservations,

            timeline:
              state.timeline,

            reflections:
              state.reflections,

            memories:
              state.memories.map(
                (memory) =>
                  memory.value
              ),
          }
        );

      if (
        execution?.status ===
        "blocked"
      ) {
        goal.status =
          "blocked";
      }

      state.goal =
        goal;

      state.currentGoal =
        goal.statement;

      state.plan =
        [
          `Plan: ${plan.title}`,

          `Goal: ${goal.statement}`,

          `Goal Status: ${goal.status}`,

          `Progress: ${goal.progress}%`,

          `Description: ${plan.description}`,

          `Status: ${plan.status}`,

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

          `Completed Milestones: ${
            plan.completedMilestones.length
          }/${plan.milestones.length}`,

          "Milestones:",

          ...plan.milestones.map(
            (
              milestone,
              index
            ) => {
              const completed =
                plan.completedMilestones.includes(
                  milestone
                );

              return `${index + 1}. ${
                completed
                  ? "[completed]"
                  : "[pending]"
              } ${milestone}`;
            }
          ),
        ].join("\n");
    }

    /*
    |--------------------------------------------------------------------------
    | Synchronize execution information.
    |--------------------------------------------------------------------------
    */

    if (execution) {
      state.execution =
        [
          `Execution: ${execution.title}`,

          `Action: ${execution.action}`,

          `Status: ${execution.status}`,

          `Plan ID: ${execution.planId}`,

          `Execution ID: ${execution.id}`,

          `Started At: ${
            execution.startedAt
              ?.toISOString() ??
            "Not started"
          }`,

          `Completed At: ${
            execution.completedAt
              ?.toISOString() ??
            "Not completed"
          }`,
        ].join("\n");
    }

    /*
    |--------------------------------------------------------------------------
    | Create runtime outcome.
    |--------------------------------------------------------------------------
    */

    state.outcome =
      createRuntimeOutcome({
        result:
          state.response,

        errors:
          state.errors,

        executionId:
          execution?.id ??
          state.currentExecutionId,

        executionStatus:
          execution?.status ??
          null,

        planId:
          execution?.planId ??
          state.currentPlanId,

        decisionId:
          state.currentDecisionId,

        stagesExecuted:
          state.executedStages,
      });

    /*
    |--------------------------------------------------------------------------
    | Determine overall runtime status.
    |--------------------------------------------------------------------------
    */

    state.runtimeStatus =
      determineRuntimeStatus(
        state,
        execution?.status ??
          null
      );

    return state;
  }
}

function determineRuntimeStatus(
  state: BrainState,
  executionStatus:
    | ExecutionStatus
    | null
): BrainRuntimeStatus {
  /*
  |--------------------------------------------------------------------------
  | Runtime errors take precedence.
  |--------------------------------------------------------------------------
  */

  if (
    state.errors.length > 0
  ) {
    return "failed";
  }

  /*
  |--------------------------------------------------------------------------
  | Blocked execution.
  |--------------------------------------------------------------------------
  */

  if (
    executionStatus ===
    "blocked"
  ) {
    return "blocked";
  }

  /*
  |--------------------------------------------------------------------------
  | Active execution.
  |--------------------------------------------------------------------------
  */

  if (
    executionStatus ===
      "pending" ||
    executionStatus ===
      "in_progress"
  ) {
    return "in_progress";
  }

  /*
  |--------------------------------------------------------------------------
  | Successful cognitive response.
  |--------------------------------------------------------------------------
  */

  if (
    state.response?.trim()
  ) {
    return "completed";
  }

  /*
  |--------------------------------------------------------------------------
  | Conservative fallback.
  |--------------------------------------------------------------------------
  */

  return "in_progress";
}