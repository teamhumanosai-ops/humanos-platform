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
 * Converts the current cognitive runtime state
 * into a structured RuntimeOutcome.
 *
 * The outcome describes what happened during the
 * cognitive runtime without falsely completing an
 * underlying execution.
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
    | Resolve actual execution lifecycle state.
    |--------------------------------------------------------------------------
    */

    let executionStatus =
      null;

    if (
      state.currentExecutionId
    ) {
      const execution =
        getExecution(
          state.currentExecutionId
        );

      if (execution) {
        executionStatus =
          execution.status;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Create structured runtime outcome.
    |--------------------------------------------------------------------------
    */

    state.outcome =
      createRuntimeOutcome({
        result:
          state.response,

        errors:
          state.errors,

        executionId:
          state.currentExecutionId,

        executionStatus,

        planId:
          state.currentPlanId,

        decisionId:
          state.currentDecisionId,

        stagesExecuted:
          state.executedStages,
      });

    return state;
  }
}