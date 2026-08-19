import {
  buildRuntimeOutcomeMemory,
} from "./outcomeMemory";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 outcome memory verification failed: ${message}`
    );
  }
}

const completed =
  buildRuntimeOutcomeMemory(
    {
      status: "completed",
      errors: [],
      metadata: {
        executionId:
          "execution-123",
      },
    } as never,
    {
      summary:
        "Action reflection: completed.",
      evidence:
        "Execution: provider-backed action completed.",
      confidence:
        0.95,
      createdAt:
        "2026-08-19T00:00:00.000Z",
    }
  );

assert(
  completed?.key ===
    "runtime-outcome:execution-123",
  "terminal execution memory must be keyed by execution identity"
);

assert(
  completed?.value.includes(
    "provider-backed action completed"
  ) === true,
  "execution reflection evidence must be retained"
);

assert(
  completed?.confidence ===
    0.95,
  "reflection confidence must be preserved"
);

const inProgress =
  buildRuntimeOutcomeMemory(
    {
      status: "in_progress",
      errors: [],
      metadata: {
        executionId:
          "execution-456",
      },
    } as never,
    {
      summary:
        "Action reflection: in_progress.",
      evidence:
        "Execution still running.",
      confidence:
        0.75,
      createdAt:
        "2026-08-19T00:00:00.000Z",
    }
  );

assert(
  inProgress === null,
  "in-progress executions must not be persisted as terminal memory"
);

const missingExecution =
  buildRuntimeOutcomeMemory(
    {
      status: "completed",
      errors: [],
      metadata: {},
    } as never,
    {
      summary:
        "Action reflection: completed.",
      evidence:
        "No execution identity.",
      confidence:
        0.95,
      createdAt:
        "2026-08-19T00:00:00.000Z",
    }
  );

assert(
  missingExecution === null,
  "outcomes without execution identity must not create ambiguous memory records"
);

console.log(
  "ATR-001 outcome memory verification passed."
);
