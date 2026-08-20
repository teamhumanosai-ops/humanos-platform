import {
  clearExecutions,
  completeExecution,
  createExecutionFromDecision,
  getExecution,
  setExecutionResult,
  startExecution,
} from "./execution";

import type { Decision } from "./decision";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ATR-001 result-immutability verification failed: ${message}`);
  }
}

const decision: Decision = {
  id: "decision-result-immutability",
  title: "Verify terminal evidence immutability",
  description: "Verify terminal execution evidence cannot be overwritten.",
  selectedAction: "test-tool:immutable-action",
  alternatives: [],
  reason: "Regression coverage.",
  confidence: 0.9,
  createdAt: new Date(),
};

clearExecutions();

const execution = createExecutionFromDecision(decision, "plan-result-immutability", null);
startExecution(execution.id);
setExecutionResult(execution.id, {
  status: "completed",
  summary: "First terminal result",
  metadata: { sequence: "first" },
  error: null,
});
completeExecution(execution.id);

let rejected = false;
try {
  setExecutionResult(execution.id, {
    status: "completed",
    summary: "Second terminal result",
    metadata: { sequence: "second" },
    error: null,
  });
} catch (error) {
  rejected = error instanceof Error && error.message.includes("cannot accept a result");
}

assert(rejected, "terminal result mutation must be rejected");
assert(getExecution(execution.id)?.result?.summary === "First terminal result", "original result must remain intact");
assert(getExecution(execution.id)?.result?.metadata.sequence === "first", "original metadata must remain intact");

clearExecutions();

console.log("ATR-001 result-immutability verification passed.");
