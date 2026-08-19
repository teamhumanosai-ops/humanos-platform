import {
  clearExecutions,
  completeExecution,
  createExecutionFromDecision,
  getExecution,
  setExecutionResult,
  startExecution,
} from "./execution";

import {
  createPlanFromMessage,
} from "./planning";

import type {
  Decision,
} from "./decision";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 execution lifecycle verification failed: ${message}`
    );
  }
}

function createDecision(): Decision {
  return {
    id:
      "decision-execution-lifecycle",
    title:
      "Execute lifecycle test",
    description:
      "Verify execution result and lifecycle invariants.",
    selectedAction:
      "test-tool:perform action",
    alternatives: [],
    reason:
      "Execution lifecycle regression coverage.",
    confidence:
      0.95,
    createdAt:
      new Date(),
  };
}

clearExecutions();

const plan =
  createPlanFromMessage(
    "Execute lifecycle test"
  );

const execution =
  createExecutionFromDecision(
    createDecision(),
    plan.id,
    {
      id:
        "route-execution-lifecycle",
      kind:
        "tool",
      action:
        "test-tool:perform action",
      target:
        "tool",
      confidence:
        0.95,
      executable:
        true,
    }
  );

assert(
  execution.status ===
    "pending",
  "new executions must start pending"
);

assert(
  startExecution(
    execution.id
  )?.status ===
    "in_progress",
  "pending executions must transition to in_progress"
);

let emptySummaryRejected =
  false;

try {
  setExecutionResult(
    execution.id,
    {
      status:
        "completed",
      summary:
        "   ",
      metadata: {},
      error:
        null,
    }
  );
} catch (error) {
  emptySummaryRejected =
    error instanceof Error &&
    error.message.includes(
      "summary cannot be empty"
    );
}

assert(
  emptySummaryRejected,
  "empty execution evidence must be rejected"
);

let completedWithErrorRejected =
  false;

try {
  setExecutionResult(
    execution.id,
    {
      status:
        "completed",
      summary:
        "Completed",
      metadata: {},
      error:
        "unexpected error",
    }
  );
} catch (error) {
  completedWithErrorRejected =
    error instanceof Error &&
    error.message.includes(
      "cannot contain an error"
    );
}

assert(
  completedWithErrorRejected,
  "completed results must not carry an error"
);

const recorded =
  setExecutionResult(
    execution.id,
    {
      status:
        "completed",
      summary:
        "Tool execution completed",
      metadata: {
        executionType:
          "registered-tool",
        toolId:
          "test-tool",
      },
      error:
        null,
    }
  );

assert(
  recorded?.result?.status ===
    "completed",
  "completed execution evidence must be persisted"
);

assert(
  recorded?.result?.metadata.toolId ===
    "test-tool",
  "execution provenance metadata must be preserved"
);

const completed =
  completeExecution(
    execution.id
  );

assert(
  completed?.status ===
    "completed",
  "an execution with completed evidence must become completed"
);

assert(
  completed?.completedAt instanceof Date,
  "completed executions must record completion time"
);

assert(
  completeExecution(
    execution.id
  ) === null,
  "completed executions must not be completed twice"
);

let lateResultRejected =
  false;

try {
  setExecutionResult(
    execution.id,
    {
      status:
        "completed",
      summary:
        "Late result",
      metadata: {},
      error:
        null,
    }
  );
} catch (error) {
  lateResultRejected =
    error instanceof Error &&
    error.message.includes(
      "cannot accept a result"
    );
}

assert(
  lateResultRejected,
  "terminal executions must reject late result mutation"
);

const persisted =
  getExecution(
    execution.id
  );

assert(
  persisted?.result?.summary ===
    "Tool execution completed",
  "terminal execution evidence must remain immutable through the public lifecycle API"
);

clearExecutions();

console.log(
  "ATR-001 execution lifecycle verification passed."
);
