import {
  createBrainState,
} from "../../brainState";

import {
  OutcomeStage,
} from "./outcomeStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Outcome reflection integration failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Record the action outcome"
  );

state.runtimeStatus =
  "completed";

state.execution =
  "Execution: Record action\nStatus: completed\nResult: Action completed";

state.actionRoute = {
  id: "route-outcome-reflection",
  kind: "tool",
  action: "test-tool:record outcome",
  target: "tool",
  confidence: 0.97,
  executable: true,
};

state.outcome = {
  status: "completed",
  result: "Action completed",
  errors: [],
  metadata: {
    executionId: "execution-outcome-reflection",
    planId: "plan-outcome-reflection",
    decisionId: "decision-outcome-reflection",
    executionStatus: "completed",
    stagesExecuted: [
      "Execution",
    ],
  },
  createdAt: new Date(),
};

await new OutcomeStage().execute(
  state
);

assert(
  state.reflections.length ===
    1,
  "outcome stage must append a runtime reflection"
);

assert(
  state.reflections[0]?.includes(
    "Action reflection"
  ) === true,
  "reflection must be identifiable as an action reflection"
);

assert(
  state.reflections[0]?.includes(
    "Status: completed"
  ) === true,
  "reflection must preserve execution status evidence"
);

const firstReflection =
  state.reflections[0];

await new OutcomeStage().execute(
  state
);

assert(
  state.reflections.length ===
    1,
  "re-entering outcome must not duplicate identical reflection evidence"
);

assert(
  state.reflections[0] ===
    firstReflection,
  "re-entering outcome must preserve the original reflection"
);

console.log(
  "Outcome reflection integration verification passed."
);
