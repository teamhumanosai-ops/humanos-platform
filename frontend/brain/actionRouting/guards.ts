import type {
  ActionRoute,
} from "./types";

export type ExecutableActionRoute =
  ActionRoute & {
    executable: true;
  };

function isFiniteConfidence(
  value: number
): boolean {
  return Number.isFinite(value) &&
    value >= 0 &&
    value <= 1;
}

function targetMatchesKind(
  route: ActionRoute
): boolean {
  if (route.kind === "provider") {
    return (
      route.target === "web-search" ||
      route.target === "web-content"
    );
  }

  if (route.kind === "tool") {
    return route.target === "tool";
  }

  if (route.kind === "internal") {
    return route.target === "cognitive";
  }

  return route.target === "unresolved";
}

export function isExecutableActionRoute(
  route: ActionRoute | null
): route is ExecutableActionRoute {
  if (!route) {
    return false;
  }

  if (!route.executable) {
    return false;
  }

  if (!route.action.trim()) {
    return false;
  }

  if (!isFiniteConfidence(route.confidence)) {
    return false;
  }

  if (!targetMatchesKind(route)) {
    return false;
  }

  return route.kind !== "unknown" &&
    route.target !== "unresolved";
}
