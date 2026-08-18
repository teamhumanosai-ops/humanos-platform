export type ActionRouteKind =
  | "internal"
  | "provider"
  | "tool"
  | "unknown";

export type ActionRouteTarget =
  | "web-search"
  | "web-content"
  | "tool"
  | "cognitive"
  | "unresolved";

export type ActionRoute = {
  id: string;

  kind: ActionRouteKind;

  action: string;

  target: ActionRouteTarget;

  confidence: number;

  executable: boolean;
};
