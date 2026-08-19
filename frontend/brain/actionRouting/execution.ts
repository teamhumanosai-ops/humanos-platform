import type {
  ActionRoute,
  ActionRouteKind,
} from "./types";

import {
  ACTION_AUTHORIZATION_POLICY_VERSION,
} from "./authorization";

import {
  isExecutableActionRoute,
} from "./guards";

export type ActionDispatchKind = Exclude<
  ActionRouteKind,
  "unknown"
>;

export type ActionDispatch = {
  routeId: string;

  kind: ActionDispatchKind;

  target: Exclude<
    ActionRoute["target"],
    "unresolved"
  >;

  action: string;

  authorizationStatus:
    "allowed";

  authorizationPolicyVersion:
    string;

  authorizationRouteId:
    string;
};

export function createActionDispatch(
  route: ActionRoute | null,
  authorizationPolicyVersion =
    ACTION_AUTHORIZATION_POLICY_VERSION
): ActionDispatch | null {
  if (!isExecutableActionRoute(route)) {
    return null;
  }

  if (
    route.kind === "unknown" ||
    route.target === "unresolved"
  ) {
    return null;
  }

  return {
    routeId:
      route.id,

    kind:
      route.kind,

    target:
      route.target,

    action:
      route.action,

    authorizationStatus:
      "allowed",

    authorizationPolicyVersion,

    authorizationRouteId:
      route.id,
  };
}
