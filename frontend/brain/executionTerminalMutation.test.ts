import {
  blockExecution,
  clearExecutions,
  completeExecution,
  createExecutionFromDecision,
  setExecutionResult,
  startExecution,
} from "./execution";

import type { Decision } from "./decision";
import { createPlanFromMessage } from "./planning";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ATR-001 terminal mutation verification failed: ${message}`);
  }
}

const decision: Decision = {
  id: "decision-terminal-mutation",
  title: "Terminal mutation test",
  description: "Verify terminal execution records cannot be reopened through lifecycle APIs.",
  selectedAction: "test-tool:terminal",
  alternatives: [],
  reason: "Lifecycle regression coverage.",
  confidence: 0.9,
  createdAt: new Date(),
};

clearExecutions();
const plan = createPlanFromMessage("Terminal mutation test");
const execution = createExecutionFromDecision(decision, plan.id);

assert(startExecution(execution.id)?.status === "in_progress", "execution must start");
assert(
  setExecutionResult(execution.id, {
    status: "completed",
    summary: "Terminal success",
    metadata: {},
    error: null,
  })?.result?.status === "completed",
  "completed result must persist"
);
assert(completeExecution(execution.id)?.status === "completed", "execution must complete");
assert(blockExecution(execution.id) === null, "completed execution must not become blocked");

clearExecutions();
const blockedExecution = createExecutionFromDecision(decision, plan.id);
assert(blockExecution(blockedExecution.id)?.status === "blocked", "pending execution must be blockable");
assert(startExecution(blockedExecution.id) === null, "blocked execution must not restart");
assert(blockExecution(blockedExecution.id) === null, "blocked execution must not block twice");

clearExecutions();
console.log("ATR-001 terminal mutation verification passed.");
