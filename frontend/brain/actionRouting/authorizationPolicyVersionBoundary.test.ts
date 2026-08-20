import {
  createBrainState,
} from "../brainState";

import {
  evaluateActionAuthorization,
  ACTION_AUTHORIZATION_POLICY_VERSION,
} from "./authorization";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR authorization policy version verification failed: ${message}`
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
  id: "route-policy-version",
  kind: "provider",
  action: "Search the web",
  target: "web-search",
  confidence: 0.95,
  executable: true,
};

const authorization =
  evaluateActionAuthorization(state);

assert(
  authorization.policyVersion ===
    ACTION_AUTHORIZATION_POLICY_VERSION,
  "authorization decisions must expose the canonical policy version"
);

assert(
  authorization.routeId ===
    state.actionRoute.id,
  "authorization policy identity must remain bound to the evaluated route"
);

assert(
  authorization.status ===
    "allowed",
  "a valid read-only provider route must remain allowed"
);

console.log(
  "ATR authorization policy version boundary verification passed."
);
