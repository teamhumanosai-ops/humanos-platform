import {
  createRuntimeOutcome,
} from "./outcome";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Runtime outcome verification failed: ${message}`
    );
  }
}

function baseInput() {
  return {
    result: null as string | null,
    errors: [] as string[],
    executionId: null as string | null,
    executionStatus: null as
      | "pending"
      | "in_progress"
      | "completed"
      | "failed"
      | "blocked"
      | null,
    planId: null as string | null,
    decisionId: null as string | null,
    stagesExecuted: [
      "Input",
      "Outcome",
    ],
  };
}

function runOutcomeStatusVerification(): void {
  const completed =
    createRuntimeOutcome({
      ...baseInput(),
      result: "Completed response",
    });

  assert(
    completed.status ===
      "completed",
    "a non-empty result must produce a completed outcome"
  );

  const failed =
    createRuntimeOutcome({
      ...baseInput(),
      result: "Completed response",
      errors: [
        "Validation failed",
      ],
    });

  assert(
    failed.status ===
      "failed",
    "errors must take precedence over a successful response"
  );

  const blocked =
    createRuntimeOutcome({
      ...baseInput(),
      executionStatus:
        "blocked",
    });

  assert(
    blocked.status ===
      "blocked",
    "blocked execution must remain blocked without a result"
  );

  const pending =
    createRuntimeOutcome({
      ...baseInput(),
      executionStatus:
        "pending",
    });

  assert(
    pending.status ===
      "in_progress",
    "pending execution must remain in progress"
  );

  const active =
    createRuntimeOutcome({
      ...baseInput(),
      executionStatus:
        "in_progress",
    });

  assert(
    active.status ===
      "in_progress",
    "active execution must remain in progress"
  );

  const empty =
    createRuntimeOutcome({
      ...baseInput(),
    });

  assert(
    empty.status ===
      "in_progress",
    "an outcome without a result must not claim completion"
  );

  console.log(
    "Runtime outcome status verification passed."
  );
}

function runOutcomeMetadataVerification(): void {
  const stages = [
    "Input",
    "Outcome",
  ];

  const errors = [
    "Example error",
  ];

  const outcome =
    createRuntimeOutcome({
      result: "Result",
      errors,
      executionId: "execution-1",
      executionStatus:
        "completed",
      planId: "plan-1",
      decisionId: "decision-1",
      stagesExecuted: stages,
    });

  stages.push(
    "Mutation"
  );

  errors.push(
    "Mutation"
  );

  assert(
    outcome.metadata.stagesExecuted.length ===
      2,
    "outcome must own a defensive copy of executed stages"
  );

  assert(
    outcome.errors.length ===
      1,
    "outcome must own a defensive copy of errors"
  );

  assert(
    outcome.metadata.executionId ===
      "execution-1",
    "execution identity must be preserved"
  );

  assert(
    outcome.metadata.planId ===
      "plan-1",
    "plan identity must be preserved"
  );

  assert(
    outcome.metadata.decisionId ===
      "decision-1",
    "decision identity must be preserved"
  );

  assert(
    outcome.metadata.executionStatus ===
      "completed",
    "execution status must be preserved"
  );

  assert(
    outcome.result ===
      "Result",
    "result must be preserved"
  );

  console.log(
    "Runtime outcome metadata verification passed."
  );
}

runOutcomeStatusVerification();
runOutcomeMetadataVerification();
