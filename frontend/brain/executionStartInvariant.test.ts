import {
  clearExecutions,
  createExecutionFromDecision,
  getExecution,
  startExecution,
} from "./execution";

import type { Decision } from "./decision";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ATR-001 start-invariant verification failed: ${message}`);
  }
}

const decision: Decision = {
  id: "decision-start-invariant",
  title: "Verify execution start invariant",
  description: "Verify only pending executions can start.",
  selectedAction: "test-tool:start-action",
  alternatives: [],
  reason: "Lifecycle regression coverage.",
  confidence: 0.9,
  createdAt: new Date(),
};

clearExecutions();

const execution = createExecutionFromDecision(decision, "plan-start-invariant", null);

const firstStart = startExecution(execution.id);
const secondStart = startExecution(execution.id);

assert(firstStart?.status === "in_progress", "pending execution must start exactly once");
assert(secondStart === null, "in-progress execution must reject duplicate start");
assert(getExecution(execution.id)?.startedAt instanceof Date, "successful start must record startedAt");
assert(getExecution(execution.id)?.status === "in_progress", "execution must remain in progress after rejected duplicate start");

clearExecutions();

console.log("ATR-001 start-invariant verification passed.");
