import {
  createActionDispatch,
} from "./execution";

import {
  ACTION_AUTHORIZATION_POLICY_VERSION,
} from "./authorization";

import type {
  ActionAuthorization,
} from "./authorization";

import type {
  ActionRoute,
} from "./types";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 dispatch verification failed: ${message}`
    );
  }
}

function allow(
  route: ActionRoute
): ActionAuthorization {
  return {
    status: "allowed",
    target: route.target,
    routeId: route.id,
    action: route.action,
    reason: "Test authorization",
    policyVersion:
      ACTION_AUTHORIZATION_POLICY_VERSION,
    evaluatedAt: new Date(),
    confirmedAt: null,
  };
}

const validRoute = {
  id: "route-1",
  kind: "provider" as const,
  action: "Search for the latest status",
  target: "web-search" as const,
  confidence: 0.9,
  executable: true,
};

const dispatch =
  createActionDispatch(
    validRoute,
    allow(validRoute)
  );

assert(
  dispatch !== null,
  "valid executable routes must create dispatch descriptors"
);

assert(
  dispatch?.routeId ===
    "route-1",
  "dispatch must preserve route identity"
);

assert(
  dispatch?.kind ===
    "provider",
  "dispatch must preserve route kind"
);

assert(
  dispatch?.target ===
    "web-search",
  "dispatch must preserve the resolved target"
);

assert(
  dispatch?.action ===
    validRoute.action,
  "dispatch must preserve the selected action"
);

assert(
  dispatch?.authorizationStatus ===
    "allowed",
  "dispatch must persist an allowed authorization decision"
);

assert(
  dispatch?.authorizationPolicyVersion ===
    ACTION_AUTHORIZATION_POLICY_VERSION,
  "dispatch must persist the canonical authorization policy version"
);

const contentRoute = {
  ...validRoute,
  id: "route-content",
  action:
    "Open https://example.com/source",
  target: "web-content" as const,
};

const contentDispatch =
  createActionDispatch(
    contentRoute,
    allow(contentRoute)
  );

assert(
  contentDispatch?.target ===
    "web-content",
  "web-content routes must preserve their concrete execution target"
);

assert(
  contentDispatch?.routeId ===
    "route-content",
  "web-content dispatch must preserve route identity"
);

assert(
  contentDispatch?.authorizationStatus ===
    "allowed",
  "web-content dispatch must preserve authorization provenance"
);

const cognitiveRoute = {
  id: "route-cognitive",
  kind: "internal" as const,
  action: "Analyze the action",
  target: "cognitive" as const,
  confidence: 0.9,
  executable: true,
};

const cognitiveDispatch =
  createActionDispatch(
    cognitiveRoute,
    allow(cognitiveRoute)
  );

assert(
  cognitiveDispatch?.kind ===
    "internal" &&
    cognitiveDispatch.target ===
      "cognitive",
  "internal cognitive routes must preserve their validated kind and target"
);

assert(
  createActionDispatch(
    {
      ...validRoute,
      kind: "internal",
    },
    allow({
      ...validRoute,
      kind: "internal",
    })
  ) === null,
  "dispatch creation must reject kind-target mismatches"
);

assert(
  createActionDispatch(
    {
      ...validRoute,
      confidence: 1.5,
    },
    allow({
      ...validRoute,
      confidence: 1.5,
    })
  ) === null,
  "dispatch creation must reject invalid confidence"
);

assert(
  createActionDispatch(
    null,
    allow(validRoute)
  ) === null,
  "missing routes must not dispatch"
);

assert(
  createActionDispatch(
    {
      ...validRoute,
      executable: false,
    },
    allow({
      ...validRoute,
      executable: false,
    })
  ) === null,
  "non-executable routes must not dispatch"
);

assert(
  createActionDispatch(
    {
      ...validRoute,
      target: "unresolved",
      kind: "unknown",
    },
    allow({
      ...validRoute,
      target: "unresolved",
      kind: "unknown",
    })
  ) === null,
  "unresolved routes must not dispatch"
);

assert(
  createActionDispatch(
    {
      ...validRoute,
      action: "   ",
    },
    allow({
      ...validRoute,
      action: "   ",
    })
  ) === null,
  "empty actions must not dispatch"
);

assert(
  createActionDispatch(
    validRoute,
    {
      ...allow(validRoute),
      routeId: "different-route",
    }
  ) === null,
  "authorization must bind to the exact route identity"
);

assert(
  createActionDispatch(
    validRoute,
    {
      ...allow(validRoute),
      target: "web-content",
    }
  ) === null,
  "authorization must bind to the exact route target"
);

assert(
  createActionDispatch(
    validRoute,
    {
      ...allow(validRoute),
      action: "Search for a different action",
    }
  ) === null,
  "authorization must bind to the exact route action"
);

assert(
  createActionDispatch(
    validRoute,
    {
      ...allow(validRoute),
      policyVersion: "atr-authorization-old",
    }
  ) === null,
  "dispatch creation must reject stale authorization policy versions"
);

assert(
  createActionDispatch(
    validRoute,
    {
      ...allow(validRoute),
      status: "requires_confirmation",
    }
  ) === null,
  "confirmation-required authorization must never create a dispatch"
);

// @ts-expect-error: dispatch creation must require an evaluated authorization snapshot.
createActionDispatch(validRoute);
