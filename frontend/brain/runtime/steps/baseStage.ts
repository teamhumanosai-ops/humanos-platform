import {
  BrainState,
} from "../../brainState";

import {
  getDecision,
} from "../../decision";

import {
  getPlan,
} from "../../planning";

import {
  getExecution,
} from "../../execution";

import {
  Stage,
} from "./stage";

/**
 * Base implementation for all Human OS cognitive stages.
 *
 * Every stage automatically:
 *
 * - validates the incoming BrainState
 * - executes its responsibility
 * - validates the returned BrainState
 * - updates timestamps
 * - captures failures
 *
 * Runtime stage history and diagnostics are owned by CognitiveRuntime.
 * This prevents BaseStage and the runtime boundary from recording the
 * same stage twice while preserving BrainState as the shared artifact.
 *
 * BrainState remains the single shared cognitive artifact.
 *
 * Domain engines never own BrainState.
 */
export abstract class BaseStage
  implements Stage {
  abstract readonly name: string;

  async execute(
    state: BrainState
  ): Promise<BrainState> {
    try {
      /*
      |--------------------------------------------------------------------------
      | Pre-stage BrainState invariant
      |--------------------------------------------------------------------------
      |
      | Every stage must receive a coherent BrainState.
      |
      */

      validateBrainState(
        state,
        this.name
      );

      /*
      |--------------------------------------------------------------------------
      | Execute stage responsibility
      |--------------------------------------------------------------------------
      */

      const result =
        await this.process(
          state
        );

      /*
      |--------------------------------------------------------------------------
      | State continuity invariant
      |--------------------------------------------------------------------------
      |
      | A stage must return the same cognitive artifact contract.
      |
      */

      if (
        !result
      ) {
        throw new Error(
          `Stage "${this.name}" returned no BrainState.`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Post-stage BrainState invariant
      |--------------------------------------------------------------------------
      */

      validateBrainState(
        result,
        this.name
      );

      /*
      |--------------------------------------------------------------------------
      | Timestamp
      |--------------------------------------------------------------------------
      */

      result.updatedAt =
        new Date();

      console.debug(
        `[Runtime] ${this.name}`
      );

      return result;
    } catch (
      error
    ) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      /*
      |--------------------------------------------------------------------------
      | Preserve failure context
      |--------------------------------------------------------------------------
      |
      | The runtime boundary owns terminal diagnostic timing. BaseStage
      | preserves the semantic error so the runtime can attach the stage,
      | timing, and failure status without creating duplicate records.
      |--------------------------------------------------------------------------
      */

      state.errors.push(
        `${this.name}: ${message}`
      );

      console.error(
        `[Runtime] ${this.name} failed`,
        error
      );

      throw error;
    }
  }

  protected abstract process(
    state: BrainState
  ): Promise<BrainState>;
}

/**
 * Validate the structural invariants that must hold
 * across the Cognitive Runtime.
 *
 * This function intentionally validates only relationships
 * that the current BrainState and domain APIs can prove.
 *
 * It does NOT invent stronger relationships that the
 * existing data models do not represent.
 */
function validateBrainState(
  state: BrainState,
  stageName: string
): void {
  /*
  |--------------------------------------------------------------------------
  | Basic state invariant
  |--------------------------------------------------------------------------
  */

  if (
    !state
  ) {
    throw new Error(
      `Stage "${stageName}" received an invalid BrainState.`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Input invariant
  |--------------------------------------------------------------------------
  */

  if (
    typeof state.userMessage !==
    "string"
  ) {
    throw new Error(
      `Stage "${stageName}" received BrainState with an invalid userMessage.`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Collection invariants
  |--------------------------------------------------------------------------
  */

  if (
    !Array.isArray(
      state.messages
    )
  ) {
    throw new Error(
      `Stage "${stageName}" received BrainState with invalid messages.`
    );
  }

  if (
    !Array.isArray(
      state.executedStages
    )
  ) {
    throw new Error(
      `Stage "${stageName}" received BrainState with invalid executedStages.`
    );
  }

  if (
    !Array.isArray(
      state.diagnostics
    )
  ) {
    throw new Error(
      `Stage "${stageName}" received BrainState with invalid diagnostics.`
    );
  }

  if (
    !Array.isArray(
      state.errors
    )
  ) {
    throw new Error(
      `Stage "${stageName}" received BrainState with invalid errors.`
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Plan invariant
  |--------------------------------------------------------------------------
  |
  | If the runtime says a plan is active, that plan must
  | exist in the Planning Engine.
  |
  */

  if (
    state.currentPlanId
  ) {
    const plan =
      getPlan(
        state.currentPlanId
      );

    if (
      !plan
    ) {
      throw new Error(
        `BrainState invariant failed: currentPlanId "${state.currentPlanId}" does not reference an existing plan.`
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Decision invariant
  |--------------------------------------------------------------------------
  |
  | If the runtime says a decision is active, that decision
  | must exist in the Decision Engine.
  |
  */

  if (
    state.currentDecisionId
  ) {
    const decision =
      getDecision(
        state.currentDecisionId
      );

    if (
      !decision
    ) {
      throw new Error(
        `BrainState invariant failed: currentDecisionId "${state.currentDecisionId}" does not reference an existing decision.`
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Execution invariant
  |--------------------------------------------------------------------------
  |
  | If an execution is active:
  |
  | 1. It must exist.
  | 2. It must reference the active plan when a plan exists.
  |
  */

  if (
    state.currentExecutionId
  ) {
    const execution =
      getExecution(
        state.currentExecutionId
      );

    if (
      !execution
    ) {
      throw new Error(
        `BrainState invariant failed: currentExecutionId "${state.currentExecutionId}" does not reference an existing execution.`
      );
    }

    if (
      state.currentPlanId &&
      execution.planId !==
        state.currentPlanId
    ) {
      throw new Error(
        `BrainState invariant failed: execution "${execution.id}" belongs to plan "${execution.planId}" but BrainState references plan "${state.currentPlanId}".`
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Runtime ID relationships
  |--------------------------------------------------------------------------
  |
  | A decision cannot exist in the runtime without a plan.
  |
  */

  if (
    state.currentDecisionId &&
    !state.currentPlanId
  ) {
    throw new Error(
      "BrainState invariant failed: currentDecisionId exists without currentPlanId."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Execution relationship
  |--------------------------------------------------------------------------
  |
  | An execution cannot exist in the runtime without
  | an active plan and decision.
  |
  */

  if (
    state.currentExecutionId &&
    !state.currentPlanId
  ) {
    throw new Error(
      "BrainState invariant failed: currentExecutionId exists without currentPlanId."
    );
  }

  if (
    state.currentExecutionId &&
    !state.currentDecisionId
  ) {
    throw new Error(
      "BrainState invariant failed: currentExecutionId exists without currentDecisionId."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Current goal invariant
  |--------------------------------------------------------------------------
  |
  | An active plan should provide the current cognitive goal.
  |
  */

  if (
    state.currentPlanId &&
    !state.currentGoal
  ) {
    throw new Error(
      "BrainState invariant failed: currentPlanId exists without currentGoal."
    );
  }
}
