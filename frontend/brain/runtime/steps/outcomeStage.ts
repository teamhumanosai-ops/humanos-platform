import {
  BrainState,
} from "../../brainState";

import {
  getExecution,
} from "../../execution";

import {
  createRuntimeOutcome,
} from "../outcome";

import {
  BaseStage,
} from "./baseStage";

/**
 * OutcomeStage
 *
 * Finalizes the cognitive runtime by creating
 * a RuntimeOutcome from the authoritative
 * BrainState and Execution Engine state.
 *
 * The Execution Engine remains the source of
 * truth for execution lifecycle status.
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
    | Resolve the authoritative execution state.
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
    | Keep BrainState execution text aligned
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
    | authoritative execution status.
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