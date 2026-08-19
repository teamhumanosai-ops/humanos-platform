import {
  createBrainState,
} from "./brainState";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `BrainState action lifecycle verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Search for the latest status"
  );

assert(
  state.actionRoute ===
    null,
  "new BrainState must not invent an action route"
);

assert(
  state.currentExecutionId ===
    null,
  "new BrainState must not invent an execution identity"
);

assert(
  state.outcome ===
    null,
  "new BrainState must not invent an outcome"
);

assert(
  state.reflections.length ===
    0,
  "new BrainState must start without reflections"
);

state.actionRoute = {
  id: "route-brain-state",
  kind: "tool",
  action: "test-tool:run",
  target: "tool",
  confidence: 0.9,
  executable: true,
};

state.currentExecutionId =
  "execution-brain-state";

state.runtimeStatus =
  "completed";

assert(
  state.actionRoute.target ===
    "tool",
  "BrainState must preserve the resolved action target"
);

assert(
  state.currentExecutionId ===
    "execution-brain-state",
  "BrainState must preserve execution identity"
);

assert(
  state.runtimeStatus ===
    "completed",
  "BrainState must expose terminal runtime status"
);

console.log(
  "BrainState action lifecycle verification passed."
);
