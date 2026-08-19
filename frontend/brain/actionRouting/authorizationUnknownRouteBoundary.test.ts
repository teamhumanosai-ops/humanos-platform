import {
  createBrainState,
} from "../brainState";

import {
  evaluateActionAuthorization,
} from "./authorization";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR unknown route authorization verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Do something unknown"
  );

state.actionRoute = {
  id: "route-unknown",
  kind: "unknown",
  action: "Do something unknown",
  target: "unresolved",
  confidence: 0.99,
  executable: false,
};

const authorization =
  evaluateActionAuthorization(state);

assert(
  authorization.status ===
    "blocked",
  "unresolved routes must be blocked"
);

assert(
  authorization.routeId ===
    "route-unknown",
  "blocked authorization must preserve the evaluated route identity"
);

assert(
  authorization.target ===
    "unresolved",
  "blocked authorization must preserve the unresolved target"
);

console.log(
  "ATR unknown route authorization verification passed."
);
