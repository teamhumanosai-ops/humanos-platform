import {
  authorizeAndCreateActionDispatch,
} from "./authorizedDispatch";

import {
  createBrainState,
} from "../brainState";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR cognitive dispatch verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Analyze the action"
  );

state.actionRoute = {
  id: "route-cognitive-authorized",
  kind: "internal",
  action: "Analyze the action",
  target: "cognitive",
  confidence: 0.88,
  executable: true,
};

const result =
  authorizeAndCreateActionDispatch(
    state
  );

assert(
  result.authorization.status ===
    "allowed",
  "cognitive execution must be allowed"
);

assert(
  result.dispatch !== null,
  "allowed cognitive execution must produce a dispatch"
);

assert(
  result.dispatch?.kind ===
    "internal",
  "cognitive dispatch must retain the internal route kind"
);

assert(
  result.dispatch?.target ===
    "cognitive",
  "cognitive dispatch must retain the cognitive target"
);
