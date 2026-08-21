import type { BrainState } from "../brainState";
import type { ActionRouteTarget } from "./types";

import {
  isExecutableActionRoute,
} from "./guards";

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
  confirmedAt: Date | null;
};

export const ACTION_AUTHORIZATION_POLICY_VERSION =
  "atr-authorization-v1";

const READ_ONLY_TARGETS: ReadonlySet<ActionRouteTarget> =
  new Set([
    "web-search",
    "web-content",
  ]);

/**
 * Explicit confirmation is held outside the mutable authorization object so
 * changing state.actionAuthorization.status cannot itself manufacture consent.
 * The confirmation is bound to the exact BrainState object, route id, target,
 * action, and authorization policy version that were presented to the user.
 */
type ActionAuthorizationConfirmation = {
  routeId: string;
  target: ActionRouteTarget;
  action: string;
  policyVersion: string;
  confirmedAt: Date;
};

const confirmations =
  new WeakMap<BrainState, ActionAuthorizationConfirmation>();

function getValidConfirmation(
  state: BrainState,
  routeId: string,
  target: ActionRouteTarget,
  action: string
): ActionAuthorizationConfirmation | null {
  const confirmation = confirmations.get(state);

  if (!confirmation) {
    return null;
  }

  if (
    confirmation.routeId !== routeId ||
    confirmation.target !== target ||
    confirmation.action !== action ||
    confirmation.policyVersion !== ACTION_AUTHORIZATION_POLICY_VERSION
  ) {
    confirmations.delete(state);
    return null;
  }

  return confirmation;
}

/**
 * Records explicit user confirmation for the currently resolved action route.
 *
 * This is the only confirmation mutation path. A confirmation is invalidated
 * automatically by route, target, action, or policy-version changes because
 * the authorization evaluator requires an exact binding before allowing a tool.
 */
export function confirmActionAuthorization(
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
        "Cannot confirm an action without a resolved action route.",
      policyVersion:
        ACTION_AUTHORIZATION_POLICY_VERSION,
      evaluatedAt,
      confirmedAt: null,
    };
  }

  if (!isExecutableActionRoute(route)) {
    return {
      status: "blocked",
      target: route.target,
      routeId: route.id,
      reason:
        "Cannot confirm an action route that failed executable-route safety validation.",
      policyVersion:
        ACTION_AUTHORIZATION_POLICY_VERSION,
      evaluatedAt,
      confirmedAt: null,
    };
  }

  const current = evaluateActionAuthorization(state);

  if (current.status !== "requires_confirmation") {
    return current;
  }

  const confirmedAt = new Date();

  confirmations.set(
    state,
    {
      routeId: route.id,
      target: route.target,
      action: route.action,
      policyVersion: ACTION_AUTHORIZATION_POLICY_VERSION,
      confirmedAt,
    }
  );

  const confirmed: ActionAuthorization = {
    ...current,
    status: "allowed",
    reason:
      "Explicit user confirmation was recorded for this exact action route.",
    evaluatedAt: new Date(),
    confirmedAt,
  };

  state.actionAuthorization = confirmed;

  return confirmed;
}

export function clearActionAuthorizationConfirmation(
  state: BrainState
): void {
  confirmations.delete(state);

  if (
    state.actionAuthorization?.target === "tool"
  ) {
    state.actionAuthorization =
      evaluateActionAuthorization(state);
  }
}

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
      confirmedAt: null,
    };
  }

  if (!isExecutableActionRoute(route)) {
    return {
      status: "blocked",
      target: route.target,
      routeId: route.id,
      reason:
        "The resolved action route failed executable-route safety validation.",
      policyVersion:
        ACTION_AUTHORIZATION_POLICY_VERSION,
      evaluatedAt,
      confirmedAt: null,
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
      confirmedAt: null,
    };
  }

  if (
    route.target === "tool"
  ) {
    const confirmation =
      getValidConfirmation(
        state,
        route.id,
        route.target,
        route.action
      );

    if (confirmation) {
      return {
        status: "allowed",
        target: route.target,
        routeId: route.id,
        reason:
          "Explicit user confirmation is bound to the exact registered tool route and action.",
        policyVersion:
          ACTION_AUTHORIZATION_POLICY_VERSION,
        evaluatedAt,
        confirmedAt:
          confirmation.confirmedAt,
      };
    }

    return {
      status: "requires_confirmation",
      target: route.target,
      routeId: route.id,
      reason:
        "Registered tool execution requires explicit user confirmation before external execution.",
      policyVersion:
        ACTION_AUTHORIZATION_POLICY_VERSION,
      evaluatedAt,
      confirmedAt: null,
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
      confirmedAt: null,
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
    confirmedAt: null,
  };
}

/**
 * Authorization is derived from the current route and the private
 * confirmation binding. A mutable BrainState authorization object alone
 * can never manufacture permission.
 */
export function isActionAuthorized(
  state: BrainState
): boolean {
  return (
    evaluateActionAuthorization(
      state
    ).status ===
    "allowed"
  );
}
