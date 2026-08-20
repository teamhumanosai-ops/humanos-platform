import {
  blockExecution,
  clearExecutions,
  createExecutionFromDecision,
  getExecution,
  startExecution,
} from "./execution";

import type { Decision } from "./decision";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ATR-001 terminal-state verification failed: ${message}`);
  }
}

const decision: Decision = {
  id: "decision-terminal-state",
  title: "Verify terminal execution state",
  description: "Verify blocked execution cannot be reactivated.",
  selectedAction: "test-tool:blocked-action",
  alternatives: [],
  reason: "Lifecycle regression coverage.",
  confidence: 0.9,
  createdAt: new Date(),
};

clearExecutions();

const execution = createExecutionFromDecision(decision, "plan-terminal-state", {
  id: "route-terminal-state",
  kind: "tool",
  action: decision.selectedAction,
  target: "tool",
  confidence: 0.9,
  executable: true,
});

assert(startExecution(execution.id)?.status === "in_progress", "execution must start before blocking");
assert(blockExecution(execution.id)?.status === "blocked", "active execution must transition to blocked");
assert(blockExecution(execution.id) === null, "blocked execution must not be blocked twice");
assert(startExecution(execution.id) === null, "blocked execution must never return to in_progress");
assert(getExecution(execution.id)?.status === "blocked", "blocked status must remain persisted");

clearExecutions();

console.log("ATR-001 terminal-state verification passed.");
