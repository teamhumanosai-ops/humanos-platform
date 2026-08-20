import {
  buildRuntimeOutcomeMemory,
} from "./outcomeMemory";

import {
  createRuntimeOutcome,
} from "./outcome";

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

const reflection = {
  summary:
    "Action reflection: completed.",
  evidence:
    "Execution: provider-backed action completed.",
  confidence:
    0.95,
  createdAt:
    "2026-08-19T00:00:00.000Z",
};

const completed =
  buildRuntimeOutcomeMemory(
    createRuntimeOutcome({
      result:
        "Provider-backed action completed.",
      errors: [],
      executionId:
        "execution-123",
      executionStatus:
        "completed",
      planId:
        "plan-123",
      decisionId:
        "decision-123",
      stagesExecuted: [
        "Execution",
        "Outcome",
        "Reflection",
      ],
    }),
    reflection
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

const failed =
  buildRuntimeOutcomeMemory(
    createRuntimeOutcome({
      result:
        null,
      errors: [
        "provider unavailable",
      ],
      executionId:
        "execution-failed",
      executionStatus:
        "completed",
      planId:
        "plan-failed",
      decisionId:
        "decision-failed",
      stagesExecuted: [
        "Execution",
        "Outcome",
      ],
    }),
    {
      ...reflection,
      summary:
        "Action reflection: failed.",
      evidence:
        "Execution failed at the provider boundary.",
      confidence:
        0.5,
    }
  );

assert(
  failed?.key ===
    "runtime-outcome:execution-failed",
  "failed terminal outcomes must still be persisted by execution identity"
);

assert(
  failed?.value.includes(
    "provider boundary"
  ) === true,
  "failed outcome reflection evidence must be retained"
);

const blocked =
  buildRuntimeOutcomeMemory(
    createRuntimeOutcome({
      result:
        null,
      errors: [],
      executionId:
        "execution-blocked",
      executionStatus:
        "blocked",
      planId:
        "plan-blocked",
      decisionId:
        "decision-blocked",
      stagesExecuted: [
        "Validation",
        "Outcome",
      ],
    }),
    {
      ...reflection,
      summary:
        "Action reflection: blocked.",
      evidence:
        "Execution was blocked by authorization.",
      confidence:
        0.5,
    }
  );

assert(
  blocked?.key ===
    "runtime-outcome:execution-blocked",
  "blocked terminal outcomes must be persisted by execution identity"
);

const inProgress =
  buildRuntimeOutcomeMemory(
    createRuntimeOutcome({
      result:
        null,
      errors: [],
      executionId:
        "execution-456",
      executionStatus:
        "in_progress",
      planId:
        "plan-456",
      decisionId:
        "decision-456",
      stagesExecuted: [
        "Execution",
      ],
    }),
    {
      ...reflection,
      summary:
        "Action reflection: in_progress.",
      evidence:
        "Execution still running.",
      confidence:
        0.75,
    }
  );

assert(
  inProgress === null,
  "in-progress executions must not be persisted as terminal memory"
);

const missingExecution =
  buildRuntimeOutcomeMemory(
    createRuntimeOutcome({
      result:
        "Completed without an execution id.",
      errors: [],
      executionId:
        null,
      executionStatus:
        "completed",
      planId:
        "plan-no-execution",
      decisionId:
        "decision-no-execution",
      stagesExecuted: [
        "Outcome",
      ],
    }),
    reflection
  );

assert(
  missingExecution === null,
  "outcomes without execution identity must not create ambiguous memory records"
);

console.log(
  "ATR-001 outcome memory verification passed."
);
