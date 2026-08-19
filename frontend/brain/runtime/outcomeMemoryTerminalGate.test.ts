import {
  buildRuntimeOutcomeMemory,
} from "./outcomeMemory";

import type {
  RuntimeOutcome,
} from "./outcome";

import type {
  RuntimeReflection,
} from "../reflection";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 outcome-memory terminal verification failed: ${message}`
    );
  }
}

const reflection: RuntimeReflection = {
  summary: "The action completed successfully.",
  evidence: "Provider execution produced the expected result.",
  confidence: 0.92,
};

const inProgress: RuntimeOutcome = {
  status: "in_progress",
  result: "Action still running",
  errors: [],
  metadata: {
    executionId: "execution-in-progress",
  },
};

assert(
  buildRuntimeOutcomeMemory(
    inProgress,
    reflection
  ) === null,
  "in-progress outcomes must never become terminal memory"
);

const missingExecutionId: RuntimeOutcome = {
  status: "completed",
  result: "Action completed",
  errors: [],
  metadata: {},
};

assert(
  buildRuntimeOutcomeMemory(
    missingExecutionId,
    reflection
  ) === null,
  "terminal memory must require a stable execution identity"
);

const completed: RuntimeOutcome = {
  status: "completed",
  result: "Action completed",
  errors: [],
  metadata: {
    executionId: "execution-completed",
  },
};

const memory =
  buildRuntimeOutcomeMemory(
    completed,
    reflection
  );

assert(
  memory?.key ===
    "runtime-outcome:execution-completed",
  "terminal memory must use execution identity as its stable key"
);

assert(
  memory?.value.includes(
    reflection.summary
  ) === true,
  "terminal memory must preserve reflection summary"
);

assert(
  memory?.value.includes(
    reflection.evidence
  ) === true,
  "terminal memory must preserve reflection evidence"
);

assert(
  memory?.confidence ===
    reflection.confidence,
  "terminal memory must preserve reflection confidence"
);

const blocked: RuntimeOutcome = {
  status: "blocked",
  result: "Action was blocked",
  errors: ["Authorization required"],
  metadata: {
    executionId: "execution-blocked",
  },
};

assert(
  buildRuntimeOutcomeMemory(
    blocked,
    reflection
  )?.key ===
    "runtime-outcome:execution-blocked",
  "blocked terminal outcomes must remain eligible for auditable memory"
);

console.log(
  "ATR-001 outcome-memory terminal verification passed."
);
