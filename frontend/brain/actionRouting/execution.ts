import type {
  ActionRoute,
} from "./types";

export type ActionDispatchKind =
  | "provider"
  | "tool"
  | "internal";

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
};

export function createActionDispatch(
  route: ActionRoute | null,
  authorizationPolicyVersion = "atr-authorization-v1"
): ActionDispatch | null {
  if (!route?.executable) {
    return null;
  }

  if (
    route.kind === "unknown" ||
    route.target === "unresolved"
  ) {
    return null;
  }

  if (!route.action.trim()) {
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
  };
}
