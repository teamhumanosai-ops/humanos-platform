import {
  createActionDispatch,
} from "./execution";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR dispatch authorization snapshot verification failed: ${message}`
    );
  }
}

const route = {
  id: "route-snapshot",
  kind: "provider" as const,
  action: "Search current status",
  target: "web-search" as const,
  confidence: 0.94,
  executable: true,
};

const dispatch =
  createActionDispatch(
    route,
    "atr-authorization-v1"
  );

assert(
  dispatch !== null,
  "an executable authorized route must produce a dispatch"
);

assert(
  dispatch?.authorizationStatus ===
    "allowed",
  "dispatch must retain the authorization decision"
);

assert(
  dispatch?.authorizationPolicyVersion ===
    "atr-authorization-v1",
  "dispatch must retain the authorization policy version"
);

assert(
  dispatch?.authorizationRouteId ===
    route.id,
  "dispatch authorization must bind to the evaluated route"
);

assert(
  dispatch?.routeId ===
    route.id,
  "dispatch identity must remain bound to the route"
);

route.action =
  "Mutated after dispatch";
route.id =
  "mutated-route";

assert(
  dispatch?.action ===
    "Search current status",
  "dispatch must snapshot the selected action before later route mutation"
);

assert(
  dispatch?.routeId ===
    "route-snapshot",
  "dispatch must snapshot route identity before later route mutation"
);

console.log(
  "ATR dispatch authorization snapshot verification passed."
);
