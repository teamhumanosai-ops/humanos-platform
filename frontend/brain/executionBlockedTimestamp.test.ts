import {
  blockExecution,
  clearExecutions,
  createExecutionFromDecision,
  getExecution,
  startExecution,
} from "./execution";

import type {
  Decision,
} from "./decision";

import {
  createPlanFromMessage,
} from "./planning";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 blocked timestamp verification failed: ${message}`
    );
  }
}

const decision: Decision = {
  id: "decision-blocked-timestamp",
  title: "Blocked timestamp test",
  description: "Verify blocked executions retain terminal timing evidence.",
  selectedAction: "test-tool:block",
  alternatives: [],
  reason: "Lifecycle regression coverage.",
  confidence: 0.9,
  createdAt: new Date(),
};

clearExecutions();

const plan = createPlanFromMessage("Blocked timestamp test");
const execution = createExecutionFromDecision(decision, plan.id);
const started = startExecution(execution.id);

assert(started?.startedAt instanceof Date, "started execution must have startedAt");

const blocked = blockExecution(execution.id);

assert(blocked?.status === "blocked", "execution must become blocked");
assert(blocked?.completedAt instanceof Date, "blocked execution must record completedAt");
assert(
  (blocked?.completedAt?.getTime() ?? 0) >= (started?.startedAt?.getTime() ?? 0),
  "terminal block time must not precede start time"
);

const persisted = getExecution(execution.id);
assert(persisted?.completedAt instanceof Date, "terminal timestamp must persist");

clearExecutions();

console.log("ATR-001 blocked timestamp verification passed.");
