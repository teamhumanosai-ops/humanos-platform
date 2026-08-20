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
    currentExecutionId:
      null,
    currentPlanId:
      null,
    currentDecisionId:
      null,
    executedStages: [
      "Input",
      "Outcome",
    ],
    diagnostics: [
      {
        stage:
          "Input",
        startedAt:
          new Date(1000),
        completedAt:
          new Date(2000),
        durationMs:
          1000,
        success:
          true,
        error:
          null,
      },
      {
        stage:
          "Outcome",
        startedAt:
          new Date(3000),
        completedAt:
          new Date(5000),
        durationMs:
          2000,
        success:
          true,
        error:
          null,
      },
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

const mismatchedDiagnosticsLength =
  createState();

mismatchedDiagnosticsLength.diagnostics = [
  mismatchedDiagnosticsLength.diagnostics[0],
];

let diagnosticsLengthFailed =
  false;

try {
  assertRuntimeStateIntegrity(
    mismatchedDiagnosticsLength
  );
} catch {
  diagnosticsLengthFailed =
    true;
}

assert(
  diagnosticsLengthFailed,
  "diagnostic count must match executed stage count"
);

const mismatchedDiagnosticStage =
  createState();

mismatchedDiagnosticStage.diagnostics[1].stage =
  "Reflection";

let diagnosticStageFailed =
  false;

try {
  assertRuntimeStateIntegrity(
    mismatchedDiagnosticStage
  );
} catch {
  diagnosticStageFailed =
    true;
}

assert(
  diagnosticStageFailed,
  "diagnostic stage order must match executed stage order"
);

const invalidDiagnosticDuration =
  createState();

invalidDiagnosticDuration.diagnostics[0].durationMs =
  -1;

let diagnosticDurationFailed =
  false;

try {
  assertRuntimeStateIntegrity(
    invalidDiagnosticDuration
  );
} catch {
  diagnosticDurationFailed =
    true;
}

assert(
  diagnosticDurationFailed,
  "diagnostic duration must be non-negative and timestamp-consistent"
);

const invalidDiagnosticSuccess =
  createState();

invalidDiagnosticSuccess.diagnostics[0].success =
  false;

let diagnosticSuccessFailed =
  false;

try {
  assertRuntimeStateIntegrity(
    invalidDiagnosticSuccess
  );
} catch {
  diagnosticSuccessFailed =
    true;
}

assert(
  diagnosticSuccessFailed,
  "failed diagnostics must preserve an error"
);

const mismatchedErrors =
  createState();

mismatchedErrors.errors = [
  "Runtime failure",
];

let errorHistoryFailed =
  false;

try {
  assertRuntimeStateIntegrity(
    mismatchedErrors
  );
} catch {
  errorHistoryFailed =
    true;
}

assert(
  errorHistoryFailed,
  "outcome errors must match BrainState errors"
);

const mismatchedExecutionId =
  createState();

mismatchedExecutionId.currentExecutionId =
  "execution-1";

let executionIdFailed =
  false;

try {
  assertRuntimeStateIntegrity(
    mismatchedExecutionId
  );
} catch {
  executionIdFailed =
    true;
}

assert(
  executionIdFailed,
  "outcome execution identity must match BrainState execution identity"
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

const inProgressMismatch =
  createState();

inProgressMismatch.outcome!.status =
  "in_progress";

let inProgressFailed =
  false;

try {
  assertRuntimeStateIntegrity(
    inProgressMismatch
  );
} catch {
  inProgressFailed =
    true;
}

assert(
  inProgressFailed,
  "in-progress outcome with completed runtime status must fail validation"
);

console.log(
  "Runtime state integrity verification passed."
);
