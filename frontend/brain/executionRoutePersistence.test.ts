import {
  clearExecutions,
  createExecutionFromDecision,
  getExecution,
} from "./execution";

import type { Decision } from "./decision";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ATR-001 route-persistence verification failed: ${message}`);
  }
}

const decision: Decision = {
  id: "decision-route-persistence",
  title: "Verify execution route persistence",
  description: "Verify execution retains the validated route descriptor.",
  selectedAction: "Search for current evidence",
  alternatives: [],
  reason: "Route provenance regression coverage.",
  confidence: 0.9,
  createdAt: new Date(),
};

clearExecutions();

const route = {
  id: "route-route-persistence",
  kind: "provider" as const,
  action: decision.selectedAction,
  target: "web-search",
  confidence: 0.9,
  executable: true,
};

const execution = createExecutionFromDecision(decision, "plan-route-persistence", route);
const persisted = getExecution(execution.id);

assert(persisted?.route?.id === route.id, "execution must retain route identity");
assert(persisted?.route?.target === route.target, "execution must retain route target");
assert(persisted?.route?.kind === route.kind, "execution must retain route kind");
assert(persisted?.route?.action === route.action, "execution must retain routed action");
assert(persisted?.route?.confidence === route.confidence, "execution must retain route confidence");

clearExecutions();

console.log("ATR-001 route-persistence verification passed.");
