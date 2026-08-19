import {
  createActionDispatch,
} from "./execution";

import {
  ACTION_AUTHORIZATION_POLICY_VERSION,
} from "./authorization";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR dispatch provenance verification failed: ${message}`
    );
  }
}

const route = {
  id: "route-web-content-1",
  kind: "provider" as const,
  action: "Fetch https://example.com",
  target: "web-content" as const,
  confidence: 0.9,
  executable: true,
};

const dispatch =
  createActionDispatch(
    route
  );

assert(
  dispatch !== null,
  "an executable route must produce a dispatch descriptor"
);

if (dispatch) {
  assert(
    dispatch.routeId ===
      route.id,
    "dispatch must preserve the route identity"
  );

  assert(
    dispatch.authorizationRouteId ===
      route.id,
    "dispatch must bind authorization to the exact route identity"
  );

  assert(
    dispatch.authorizationStatus ===
      "allowed",
    "dispatch must only represent an allowed authorization decision"
  );

  assert(
    dispatch.authorizationPolicyVersion ===
      ACTION_AUTHORIZATION_POLICY_VERSION,
    "dispatch must use the canonical authorization policy version by default"
  );
}

console.log(
  "ATR dispatch authorization provenance verification passed."
);
