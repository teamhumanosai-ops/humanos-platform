import type {
  ActionRoute,
  ActionRouteKind,
} from "./types";

import {
  ACTION_AUTHORIZATION_POLICY_VERSION,
} from "./authorization";

import type {
  ActionAuthorization,
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
  authorization: ActionAuthorization
): ActionDispatch | null {
  if (!isExecutableActionRoute(route)) {
    return null;
  }

  if (
    authorization.status !== "allowed" ||
    authorization.policyVersion !==
      ACTION_AUTHORIZATION_POLICY_VERSION ||
    authorization.routeId !== route.id ||
    authorization.target !== route.target ||
    authorization.action !== route.action
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
      authorization.status,

    authorizationPolicyVersion:
      authorization.policyVersion,

    authorizationRouteId:
      authorization.routeId,
  };
}
