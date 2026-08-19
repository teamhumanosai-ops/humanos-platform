import {
  createBrainState,
} from "../../brainState";

import {
  ActionDispatchStage,
} from "./actionDispatchStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 dispatch-stage verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Search for status"
  );

state.actionRoute = {
  id: "route-dispatch",
  kind: "provider",
  action: "Search for status",
  target: "web-search",
  confidence: 0.9,
  executable: true,
};

await new ActionDispatchStage().execute(
  state
);

assert(
  state.errors.length === 0,
  "valid routes must dispatch without errors"
);

assert(
  state.execution?.includes(
    "Dispatch: provider/web-search"
  ) === true,
  "dispatch metadata must preserve route kind and target"
);

assert(
  state.execution?.includes(
    "Route ID: route-dispatch"
  ) === true,
  "dispatch metadata must preserve route identity"
);

const invalidState =
  createBrainState(
    "conversation",
    [],
    "Do something ambiguous"
  );

invalidState.actionRoute = {
  id: "route-invalid",
  kind: "unknown",
  action: "Do something ambiguous",
  target: "unresolved",
  confidence: 0,
  executable: false,
};

await new ActionDispatchStage().execute(
  invalidState
);

assert(
  invalidState.errors.some(
    (error) =>
      error.includes(
        "safe dispatch descriptor"
      )
  ),
  "invalid routes must be rejected by the dispatch stage"
);
