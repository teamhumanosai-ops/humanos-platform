import {
  createActionDispatch,
} from "./execution";

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
    "atr-authorization-v1"
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
    "atr-authorization-v1",
  "dispatch must persist the authorization policy version"
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
    contentRoute
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

const cognitiveDispatch =
  createActionDispatch({
    id: "route-cognitive",
    kind: "internal",
    action: "Analyze the action",
    target: "cognitive",
    confidence: 0.9,
    executable: true,
  });

assert(
  cognitiveDispatch?.kind ===
    "internal" &&
    cognitiveDispatch.target ===
      "cognitive",
  "internal cognitive routes must preserve their validated kind and target"
);

assert(
  createActionDispatch({
    ...validRoute,
    kind: "internal",
  }) === null,
  "dispatch creation must reject kind-target mismatches"
);

assert(
  createActionDispatch({
    ...validRoute,
    confidence: 1.5,
  }) === null,
  "dispatch creation must reject invalid confidence"
);

assert(
  createActionDispatch(null) ===
    null,
  "missing routes must not dispatch"
);

assert(
  createActionDispatch({
    ...validRoute,
    executable: false,
  }) === null,
  "non-executable routes must not dispatch"
);

assert(
  createActionDispatch({
    ...validRoute,
    target: "unresolved",
    kind: "unknown",
  }) === null,
  "unresolved routes must not dispatch"
);

assert(
  createActionDispatch({
    ...validRoute,
    action: "   ",
  }) === null,
  "empty actions must not dispatch"
);
