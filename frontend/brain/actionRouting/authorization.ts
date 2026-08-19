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

const POLICY_VERSION = "atr-authorization-v1";

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
      policyVersion: POLICY_VERSION,
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
      policyVersion: POLICY_VERSION,
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
      policyVersion: POLICY_VERSION,
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
      policyVersion: POLICY_VERSION,
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
      policyVersion: POLICY_VERSION,
      evaluatedAt,
    };
  }

  return {
    status: "blocked",
    target: route.target,
    routeId: route.id,
    reason:
      "The action target is not recognized by the authorization policy.",
    policyVersion: POLICY_VERSION,
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
