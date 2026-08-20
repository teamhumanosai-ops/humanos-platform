import {
  createActionDispatch,
} from "./execution";

import {
  ACTION_AUTHORIZATION_POLICY_VERSION,
} from "./authorization";

import type {
  ActionAuthorization,
} from "./authorization";

import {
  getActionCapability,
} from "./capabilities";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR dispatch boundary verification failed: ${message}`
    );
  }
}

const route = {
  id: "route-boundary",
  kind: "provider" as const,
  action: "Search current status",
  target: "web-search" as const,
  confidence: 0.88,
  executable: true,
};

const authorization: ActionAuthorization = {
  status: "allowed",
  target: route.target,
  routeId: route.id,
  reason: "Test authorization",
  policyVersion:
    ACTION_AUTHORIZATION_POLICY_VERSION,
  evaluatedAt: new Date(),
};

const dispatch =
  createActionDispatch(
    route,
    authorization
  );

assert(
  dispatch !== null,
  "validated route must create a dispatch descriptor"
);

const capability =
  getActionCapability(
    dispatch?.target ?? ""
  );

assert(
  capability !== null,
  "dispatch target must resolve to a registered capability"
);

assert(
  dispatch?.target ===
    capability?.target,
  "dispatch and capability must share the same target boundary"
);

assert(
  dispatch?.routeId ===
    route.id,
  "dispatch must preserve route identity before execution"
);

assert(
  dispatch?.action ===
    route.action,
  "dispatch must preserve the selected action before execution"
);

console.log(
  "ATR dispatch capability boundary verification passed."
);
