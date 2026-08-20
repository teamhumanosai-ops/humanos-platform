import {
  BrainState,
} from "../brainState";

import {
  assertRuntimeStateIntegrity,
} from "./runtimeStateIntegrity";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Runtime state integrity verification failed: ${message}`
    );
  }
}

function createState(): BrainState {
  return {
    runtimeStatus:
      "completed",
    executedStages: [
      "Input",
      "Outcome",
    ],
    errors: [],
    outcome: {
      status:
        "completed",
      result:
        "done",
      errors: [],
      metadata: {
        executionId:
          null,
        executionStatus:
          null,
        executionResult:
          null,
        planId:
          null,
        decisionId:
          null,
        stagesExecuted: [
          "Input",
          "Outcome",
        ],
        createdAt:
          new Date(),
        completedAt:
          new Date(),
      },
    },
  } as unknown as BrainState;
}

const valid =
  createState();

assert(
  assertRuntimeStateIntegrity(
    valid
  ) === valid,
  "a coherent terminal BrainState must pass validation"
);

const mismatchedHistory =
  createState();

mismatchedHistory.outcome!.metadata.stagesExecuted = [
  "Input",
];

let historyFailed =
  false;

try {
  assertRuntimeStateIntegrity(
    mismatchedHistory
  );
} catch {
  historyFailed =
    true;
}

assert(
  historyFailed,
  "mismatched outcome stage history must fail validation"
);

const failedWithoutError =
  createState();

failedWithoutError.outcome!.status =
  "failed";

let failureFailed =
  false;

try {
  assertRuntimeStateIntegrity(
    failedWithoutError
  );
} catch {
  failureFailed =
    true;
}

assert(
  failureFailed,
  "failed outcome without runtime errors must fail validation"
);

const blockedMismatch =
  createState();

blockedMismatch.outcome!.status =
  "blocked";

let blockedFailed =
  false;

try {
  assertRuntimeStateIntegrity(
    blockedMismatch
  );
} catch {
  blockedFailed =
    true;
}

assert(
  blockedFailed,
  "blocked outcome with completed runtime status must fail validation"
);

console.log(
  "Runtime state integrity verification passed."
);
