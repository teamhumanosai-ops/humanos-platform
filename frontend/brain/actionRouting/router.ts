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

function isExplicitToolAction(
  action: string
): boolean {
  return /^tool:[a-z0-9][a-z0-9._-]*:\s*.+$/i.test(
    action
  );
}

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

function resolveRouteTarget(
  kind: ActionRoute["kind"],
  target: ActionRouteTarget
): ActionRouteTarget {
  if (
    kind === "provider" &&
    (
      target === "web-search" ||
      target === "web-content"
    )
  ) {
    return target;
  }

  if (
    kind === "tool" &&
    target === "tool"
  ) {
    return "tool";
  }

  if (
    kind === "internal" &&
    target === "cognitive"
  ) {
    return "cognitive";
  }

  return "unresolved";
}

export function routeDecisionAction(
  decision: Decision
): ActionRoute {
  const action =
    decision.selectedAction.trim();

  const explicitTool =
    isExplicitToolAction(
      action
    );

  const rule =
    explicitTool
      ? {
          kind: "tool" as const,
          target: "tool" as const,
          keywords: [
            "tool:<id>:<action>",
          ],
        }
      : findActionRouteRule(
          action
        );

  const kind =
    rule?.kind ??
    "unknown";

  const target =
    resolveRouteTarget(
      kind,
      rule?.target ??
        "unresolved"
    );

  const executable =
    action.length > 0 &&
    kind !== "unknown" &&
    target !== "unresolved";

  return {
    id: `route-${decision.id}`,
    kind,
    action,
    target,
    confidence:
      normalizeConfidence(
        decision.confidence
      ),
    executable,
  };
}
