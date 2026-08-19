import type {
  Decision,
} from "../decision";

import {
  findActionRouteRule,
} from "./registry";

import type {
  ActionRoute,
  ActionRouteTarget,
} from "./types";

function normalizeConfidence(
  value: number
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      1,
      value
    )
  );
}

function inferRouteKind(
  action: string
): ActionRoute["kind"] {
  return (
    findActionRouteRule(
      action
    )?.kind ??
    "unknown"
  );
}

function resolveRouteTarget(
  kind: ActionRoute["kind"],
  action: string
): ActionRouteTarget {
  return (
    findActionRouteRule(
      action
    )?.target ??
    (kind === "unknown"
      ? "unresolved"
      : kind === "provider"
        ? "web-search"
        : kind === "tool"
          ? "tool"
          : "cognitive")
  );
}

export function routeDecisionAction(
  decision: Decision
): ActionRoute {
  const action =
    decision.selectedAction.trim();

  const kind =
    inferRouteKind(action);

  const executable =
    kind !== "unknown" &&
    action.length > 0;

  return {
    id: `route-${decision.id}`,
    kind,
    action,
    target: resolveRouteTarget(
      kind,
      action
    ),
    confidence: normalizeConfidence(
      decision.confidence
    ),
    executable,
  };
}
