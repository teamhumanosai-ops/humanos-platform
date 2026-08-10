import { BrainState } from "../../brainState";

import {
  createRuntimeOutcome,
} from "../outcome";

import { BaseStage } from "./baseStage";

/**
 * OutcomeStage
 *
 * Converts the completed cognitive runtime
 * into a structured RuntimeOutcome.
 *
 * This stage observes the runtime result.
 *
 * It does NOT complete the underlying Execution.
 * Execution completion requires an actual executor
 * to perform the selected action.
 */
export class OutcomeStage
  extends BaseStage {
  readonly name = "Outcome";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    state.outcome =
      createRuntimeOutcome({
        result:
          state.response,

        errors:
          state.errors,

        executionId:
          state.currentExecutionId,

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