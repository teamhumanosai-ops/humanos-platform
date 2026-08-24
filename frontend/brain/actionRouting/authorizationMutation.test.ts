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
      `ATR authorization mutation verification failed: ${message}`
    );
  }
}

const state =
  createBrainState(
    "conversation",
    [],
    "Search the web"
  );

state.actionRoute = {
  id: "route-original",
  kind: "provider",
  action: "Search the web",
  target: "web-search",
  confidence: 0.95,
  executable: true,
};

const original =
  evaluateActionAuthorization(
    state
  );

state.actionRoute = {
  ...state.actionRoute,
  id: "route-replaced",
  kind: "tool",
  target: "tool",
};

const replaced =
  evaluateActionAuthorization(
    state
  );

assert(
  original.routeId ===
    "route-original",
  "the first authorization decision must remain bound to its evaluated route"
);

assert(
  original.target ===
    "web-search",
  "the first authorization decision must preserve its evaluated target"
);

assert(
  replaced.routeId ===
    "route-replaced",
  "a changed route must receive a newly evaluated authorization identity"
);

assert(
  replaced.status ===
    "requires_confirmation",
  "a changed route to a side-effecting tool must not inherit read-only authorization"
);

console.log(
  "ATR authorization re-evaluation binding verification passed."
);
