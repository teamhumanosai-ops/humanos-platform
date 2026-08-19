import {
  authorizeAndCreateActionDispatch,
} from "./index";

import {
  createBrainState,
} from "../brainState";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 public-boundary verification failed: ${message}`
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
  id: "route-public-boundary",
  kind: "provider",
  action: "Search for status",
  target: "web-search",
  confidence: 0.9,
  executable: true,
};

const result =
  authorizeAndCreateActionDispatch(
    state
  );

assert(
  result.authorization.status ===
    "allowed",
  "the public action-routing boundary must expose centralized authorization"
);

assert(
  result.dispatch?.routeId ===
    state.actionRoute.id,
  "the public boundary must preserve route identity"
);

assert(
  result.dispatch?.target ===
    state.actionRoute.target,
  "the public boundary must preserve the validated execution target"
);

assert(
  result.dispatch?.authorizationPolicyVersion ===
    result.authorization.policyVersion,
  "dispatch must retain the policy version used by authorization"
);
