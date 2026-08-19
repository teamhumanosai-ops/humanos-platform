import type { BrainState } from "../brainState";
import type { ActionRouteTarget } from "./types";

export type ActionAuthorizationStatus =
  | "allowed"
  | "requires_confirmation"
  | "blocked";

export type ActionAuthorization = {
  status: ActionAuthorizationStatus;
  target: ActionRouteTarget;
  routeId: string;
  reason: string;
  policyVersion: string;
  evaluatedAt: Date;
};

export const ACTION_AUTHORIZATION_POLICY_VERSION =
  "atr-authorization-v1";

const READ_ONLY_TARGETS: ReadonlySet<ActionRouteTarget> =
  new Set([
    "web-search",
    "web-content",
  ]);

export function evaluateActionAuthorization(
  state: BrainState
): ActionAuthorization {
  const route = state.actionRoute;
  const evaluatedAt = new Date();

  if (!route) {
    return {
      status: "blocked",
      target: "unresolved",
      routeId: "unresolved",
      reason:
        "No resolved action route exists for authorization.",
      policyVersion:
        ACTION_AUTHORIZATION_POLICY_VERSION,
      evaluatedAt,
    };
  }

  if (!route.executable) {
    return {
      status: "blocked",
      target: route.target,
      routeId: route.id,
      reason:
        "The resolved action is not executable.",
      policyVersion:
        ACTION_AUTHORIZATION_POLICY_VERSION,
      evaluatedAt,
    };
  }

  if (
    READ_ONLY_TARGETS.has(
      route.target
    )
  ) {
    return {
      status: "allowed",
      target: route.target,
      routeId: route.id,
      reason:
        "Read-only provider execution is allowed by the current action policy.",
      policyVersion:
        ACTION_AUTHORIZATION_POLICY_VERSION,
      evaluatedAt,
    };
  }

  if (
    route.target === "tool"
  ) {
    return {
      status: "requires_confirmation",
      target: route.target,
      routeId: route.id,
      reason:
        "Registered tool execution requires explicit user confirmation before external execution.",
      policyVersion:
        ACTION_AUTHORIZATION_POLICY_VERSION,
      evaluatedAt,
    };
  }

  if (
    route.target === "cognitive"
  ) {
    return {
      status: "allowed",
      target: route.target,
      routeId: route.id,
      reason:
        "Internal cognitive execution does not perform an external side effect by itself.",
      policyVersion:
        ACTION_AUTHORIZATION_POLICY_VERSION,
      evaluatedAt,
    };
  }

  return {
    status: "blocked",
    target: route.target,
    routeId: route.id,
    reason:
      "The action target is not recognized by the authorization policy.",
    policyVersion:
      ACTION_AUTHORIZATION_POLICY_VERSION,
    evaluatedAt,
  };
}

export function isActionAuthorized(
  state: BrainState
): boolean {
  return (
    state.actionAuthorization?.status ===
    "allowed"
  );
}
