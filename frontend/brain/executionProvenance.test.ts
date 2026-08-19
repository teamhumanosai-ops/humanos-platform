import {
  createExecutionFromDecision,
  getExecution,
  clearExecutions,
} from "./execution";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Execution provenance verification failed: ${message}`
    );
  }
}

clearExecutions();

const decision = {
  id: "decision-provenance",
  title: "Search current status",
  description: "Execute a provider-backed search.",
  selectedAction: "Search current status",
  alternatives: [],
  reason: "The selected provider route is executable.",
  confidence: 0.92,
  createdAt: new Date(),
};

const route = {
  id: "route-provenance",
  kind: "provider" as const,
  action: decision.selectedAction,
  target: "web-search" as const,
  confidence: 0.92,
  executable: true,
};

const execution =
  createExecutionFromDecision(
    decision,
    "plan-provenance",
    route
  );

const stored =
  getExecution(
    execution.id
  );

assert(
  stored?.route?.id ===
    "route-provenance",
  "execution must preserve route identity"
);

assert(
  stored?.route?.kind ===
    "provider",
  "execution must preserve route kind"
);

assert(
  stored?.route?.target ===
    "web-search",
  "execution must preserve provider target"
);

assert(
  stored?.route?.confidence ===
    0.92,
  "execution must preserve routing confidence"
);

assert(
  stored?.planId ===
    "plan-provenance",
  "execution must preserve plan ownership"
);

clearExecutions();

console.log(
  "Execution provenance verification passed."
);
