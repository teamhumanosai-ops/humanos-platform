import {
  blockExecution,
  clearExecutions,
  createExecutionFromDecision,
  getExecution,
  setExecutionResult,
  startExecution,
} from "./execution";

import type { Decision } from "./decision";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ATR-001 blocked-result verification failed: ${message}`);
  }
}

const decision: Decision = {
  id: "decision-blocked-result",
  title: "Verify blocked result contract",
  description: "Verify failure evidence survives terminal blocking.",
  selectedAction: "test-tool:failing-action",
  alternatives: [],
  reason: "Failure propagation regression coverage.",
  confidence: 0.9,
  createdAt: new Date(),
};

clearExecutions();

const execution = createExecutionFromDecision(decision, "plan-blocked-result", null);
startExecution(execution.id);

const recorded = setExecutionResult(execution.id, {
  status: "blocked",
  summary: "External action failed.",
  metadata: {
    failureClass: "provider",
    provider: "test-provider",
  },
  error: "provider timeout",
});

assert(recorded?.result?.status === "blocked", "blocked result status must persist");
assert(recorded?.result?.error === "provider timeout", "failure reason must persist");
assert(recorded?.result?.metadata.provider === "test-provider", "provider provenance must persist");
assert(blockExecution(execution.id)?.status === "blocked", "blocked evidence must produce blocked execution state");
assert(getExecution(execution.id)?.result?.error === "provider timeout", "terminal blocking must not erase failure evidence");

clearExecutions();

console.log("ATR-001 blocked-result verification passed.");
