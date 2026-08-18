export type ActionRouteKind =
  | "internal"
  | "provider"
  | "tool"
  | "unknown";

export type ActionRoute = {
  id: string;

  kind: ActionRouteKind;

  action: string;

  target: string;

  confidence: number;

  executable: boolean;
};
