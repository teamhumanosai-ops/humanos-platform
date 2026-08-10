import type {
  ExecutionStatus,
} from "../execution";

export type RuntimeOutcomeStatus =
  | "completed"
  | "failed";

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
    input.errors.length > 0
      ? "failed"
      : "completed";

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