import {
  ACTION_AUTHORIZATION_POLICY_VERSION,
} from "./authorization";

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
      `ATR dispatch policy verification failed: ${message}`
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
  id: "route-policy",
  kind: "provider",
  action: "Search the web",
  target: "web-search",
  confidence: 0.97,
  executable: true,
};

const result =
  authorizeAndCreateActionDispatch(
    state
  );

assert(
  result.authorization.policyVersion ===
    ACTION_AUTHORIZATION_POLICY_VERSION,
  "authorization must use the canonical policy version"
);

assert(
  result.dispatch?.authorizationPolicyVersion ===
    ACTION_AUTHORIZATION_POLICY_VERSION,
  "dispatch must inherit the canonical authorization policy version"
);
