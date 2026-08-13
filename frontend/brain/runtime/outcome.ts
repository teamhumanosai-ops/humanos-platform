import type {
  ExecutionStatus,
} from "../execution";

export type RuntimeOutcomeStatus =
  | "in_progress"
  | "completed"
  | "failed"
  | "blocked";

export type RuntimeOutcome = {
  status:
    RuntimeOutcomeStatus;

  result:
    string | null;

  errors:
    string[];

  metadata: {
    executionId:
      string | null;

    executionStatus:
      ExecutionStatus | null;

    planId:
      string | null;

    decisionId:
      string | null;

    stagesExecuted:
      string[];

    createdAt:
      Date;

    completedAt:
      Date;
  };
};

export function createRuntimeOutcome(
  input: {
    result:
      string | null;

    errors:
      string[];

    executionId:
      string | null;

    executionStatus:
      ExecutionStatus | null;

    planId:
      string | null;

    decisionId:
      string | null;

    stagesExecuted:
      string[];
  }
): RuntimeOutcome {
  const completedAt =
    new Date();

  const status:
    RuntimeOutcomeStatus =
    determineOutcomeStatus(
      input
    );

  return {
    status,

    result:
      input.result,

    errors:
      [...input.errors],

    metadata: {
      executionId:
        input.executionId,

      executionStatus:
        input.executionStatus,

      planId:
        input.planId,

      decisionId:
        input.decisionId,

      stagesExecuted:
        [...input.stagesExecuted],

      createdAt:
        completedAt,

      completedAt,
    },
  };
}

function determineOutcomeStatus(
  input: {
    result:
      string | null;

    errors:
      string[];

    executionStatus:
      ExecutionStatus | null;
  }
): RuntimeOutcomeStatus {
  /*
  |--------------------------------------------------------------------------
  | Runtime failures take precedence.
  |--------------------------------------------------------------------------
  */

  if (
    input.errors.length > 0
  ) {
    return "failed";
  }

  /*
  |--------------------------------------------------------------------------
  | Blocked execution.
  |--------------------------------------------------------------------------
  */

  if (
    input.executionStatus ===
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
    input.executionStatus ===
      "pending" ||
    input.executionStatus ===
      "in_progress"
  ) {
    return "in_progress";
  }

  /*
  |--------------------------------------------------------------------------
  | Completed cognitive response.
  |--------------------------------------------------------------------------
  */

  if (
    input.result?.trim()
  ) {
    return "completed";
  }

  /*
  |--------------------------------------------------------------------------
  | No response and no active execution.
  |--------------------------------------------------------------------------
  |
  | The runtime cannot claim completion when there
  | is no actual result. Keep the outcome conservative.
  |
  */

  return "in_progress";
}