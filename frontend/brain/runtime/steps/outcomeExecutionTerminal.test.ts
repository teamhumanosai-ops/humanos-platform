import {
  createBrainState,
} from "../../brainState";

import {
  clearExecutions,
  createExecutionFromDecision,
  getExecution,
  setExecutionResult,
  startExecution,
} from "../../execution";

import { createPlanFromMessage } from "../../planning";
import { saveDecision } from "../../decision";
import type { Decision } from "../../decision";
import { OutcomeStage } from "./outcomeStage";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ATR-001 outcome terminal verification failed: ${message}`);
  }
}

clearExecutions();

const state = createBrainState(
  "Outcome terminal execution test",
  [],
  "Outcome terminal execution test"
);

const plan = createPlanFromMessage("Outcome terminal execution test");
const decision: Decision = {
  id: "decision-outcome-terminal",
  title: "Outcome terminal test",
  description: "Verify Outcome reads persisted execution terminal evidence.",
  selectedAction: "test-tool:outcome",
  alternatives: [],
  reason: "ATR-001 outcome regression coverage.",
  confidence: 0.9,
  createdAt: new Date(),
};

saveDecision(decision);
const execution = createExecutionFromDecision(decision, plan.id);
startExecution(execution.id);
setExecutionResult(execution.id, {
  status: "completed",
  summary: "Persisted terminal result",
  metadata: { source: "atr-001-test" },
  error: null,
});

state.currentPlanId = plan.id;
state.currentDecisionId = decision.id;
state.currentExecutionId = execution.id;

await new OutcomeStage().execute(state);

const persisted = getExecution(execution.id);
assert(persisted?.result?.status === "completed", "execution result must remain completed");
assert(state.outcome !== null, "OutcomeStage must create a runtime outcome");
assert(state.execution?.includes("Result Status: completed") === true, "Outcome must expose terminal result status");
assert(state.execution?.includes("Result: Persisted terminal result") === true, "Outcome must expose terminal result summary");
assert(state.runtimeStatus === "completed", "completed execution must produce completed runtime status");

clearExecutions();
console.log("ATR-001 outcome terminal verification passed.");
