import type {
  Decision,
} from "../decision";

import type {
  ActionRoute,
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
    target: kind === "unknown"
      ? "unresolved"
      : kind,
    confidence: normalizeConfidence(
      decision.confidence
    ),
    executable,
  };
}
