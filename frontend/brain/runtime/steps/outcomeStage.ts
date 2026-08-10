import {
  BrainState,
} from "../../brainState";

import {
  getExecution,
} from "../../execution";

import {
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
 * - Runtime outcome
 *
 * The Execution Engine remains authoritative
 * for execution lifecycle state.
 */
export class OutcomeStage
  extends BaseStage {
  readonly name =
    "Outcome";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /*
    |--------------------------------------------------------------------------
    | Resolve the authoritative execution.
    |--------------------------------------------------------------------------
    */

    const execution =
      state.currentExecutionId
        ? getExecution(
            state.currentExecutionId
          )
        : undefined;

    /*
    |--------------------------------------------------------------------------
    | Synchronize plan information.
    |--------------------------------------------------------------------------
    */

    const plan =
      state.currentPlanId
        ? getPlan(
            state.currentPlanId
          )
        : undefined;

    /*
    |--------------------------------------------------------------------------
    | Keep BrainState plan information synchronized
    | with the persisted plan.
    |--------------------------------------------------------------------------
    */

    if (plan) {
      state.currentGoal =
        plan.goal;

      state.plan =
        [
          `Plan: ${plan.title}`,

          `Goal: ${plan.goal}`,

          `Description: ${plan.description}`,

          `Status: ${plan.status}`,

          `Next Action: ${plan.nextAction}`,

          `Priority: ${plan.priority}`,

          `Confidence: ${plan.confidence}`,

          `Completed Milestones: ${
            plan.completedMilestones.length
          }/${plan.milestones.length
          }`,

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
    | Keep BrainState execution text synchronized
    | with the actual execution record.
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
    | Create the runtime outcome from the
    | authoritative execution state.
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

    return state;
  }
}