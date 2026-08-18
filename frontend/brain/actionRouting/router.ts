import type {
  Decision,
} from "../decision";

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
  const normalized =
    action.trim().toLowerCase();

  if (!normalized) {
    return "unknown";
  }

  if (
    normalized.includes("search") ||
    normalized.includes("browse") ||
    normalized.includes("fetch")
  ) {
    return "provider";
  }

  if (
    normalized.includes("send") ||
    normalized.includes("create") ||
    normalized.includes("update") ||
    normalized.includes("delete")
  ) {
    return "tool";
  }

  if (
    normalized.includes("review") ||
    normalized.includes("prepare") ||
    normalized.includes("analyze") ||
    normalized.includes("plan")
  ) {
    return "internal";
  }

  return "unknown";
}

function resolveRouteTarget(
  kind: ActionRoute["kind"],
  action: string
): ActionRouteTarget {
  const normalized =
    action.trim().toLowerCase();

  if (kind === "provider") {
    if (
      normalized.includes("browse") ||
      normalized.includes("fetch")
    ) {
      return "web-content";
    }

    return "web-search";
  }

  if (kind === "tool") {
    return "tool";
  }

  if (kind === "internal") {
    return "cognitive";
  }

  return "unresolved";
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
