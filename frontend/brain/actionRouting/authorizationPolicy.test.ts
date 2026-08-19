import {
  ACTION_AUTHORIZATION_POLICY_VERSION,
  evaluateActionAuthorization,
} from "./authorization";

import {
  createBrainState,
} from "../brainState";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR authorization policy verification failed: ${message}`
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
  id: "route-search-1",
  kind: "provider",
  action: "Search the web",
  target: "web-search",
  confidence: 0.95,
  executable: true,
};

const authorization =
  evaluateActionAuthorization(
    state
  );

assert(
  authorization.status ===
    "allowed",
  "read-only web search must be allowed"
);

assert(
  authorization.policyVersion ===
    ACTION_AUTHORIZATION_POLICY_VERSION,
  "authorization must expose the canonical policy identity"
);

assert(
  authorization.routeId ===
    "route-search-1",
  "authorization must bind to the exact route that was evaluated"
);

assert(
  authorization.target ===
    "web-search",
  "authorization must preserve the evaluated route target"
);

console.log(
  "ATR authorization policy identity verification passed."
);
