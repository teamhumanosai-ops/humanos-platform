import {
  createRuntimeReflection,
} from "./runtime";

import {
  createBrainState,
} from "../brainState";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Runtime reflection verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Search for the latest status"
  );

state.actionRoute = {
  id: "route-reflection",
  kind: "provider",
  action: "Search for the latest status",
  target: "web-search",
  confidence: 0.91,
  executable: true,
};

state.execution =
  "Execution: Search\nStatus: completed";

state.runtimeStatus =
  "completed";

state.outcome = {
  status: "completed",
  result: "Search completed",
  errors: [],
  metadata: {
    executionId: "execution-reflection",
    planId: "plan-reflection",
    decisionId: "decision-reflection",
    executionStatus: "completed",
    stagesExecuted: [
      "ActionRouting",
      "ActionDispatch",
      "Execution",
      "Outcome",
    ],
  },
  createdAt: new Date(),
};

const reflection =
  createRuntimeReflection(
    state
  );

assert(
  reflection.summary.includes(
    "completed"
  ),
  "successful execution must produce a completed reflection"
);

assert(
  reflection.evidence.includes(
    "Search for the latest status"
  ),
  "reflection must preserve the selected action"
);

assert(
  reflection.evidence.includes(
    "Status: completed"
  ),
  "reflection must preserve execution evidence"
);

assert(
  reflection.confidence ===
    0.95,
  "completed execution must receive high reflection confidence"
);

state.errors.push(
  "Provider unavailable"
);

const failedReflection =
  createRuntimeReflection(
    state
  );

assert(
  failedReflection.summary.includes(
    "error(s)"
  ),
  "failed execution must surface error count in reflection"
);

assert(
  failedReflection.evidence.includes(
    "Error: Provider unavailable"
  ),
  "reflection must preserve failure evidence"
);

assert(
  failedReflection.confidence ===
    0.5,
  "failed execution must lower reflection confidence"
);

console.log(
  "Runtime reflection verification passed."
);
