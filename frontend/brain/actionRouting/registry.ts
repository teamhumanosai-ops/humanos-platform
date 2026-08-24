import type {
  ActionRoute,
} from "./types";

export type ActionRouteRule = {
  kind: ActionRoute["kind"];

  target: ActionRoute["target"];

  keywords: string[];
};

/**
 * Canonical action-routing rules.
 *
 * Rules are ordered by routing precedence. Provider actions are evaluated
 * before tool actions so that information-retrieval language remains inside
 * the existing web-intelligence boundary rather than falling through to a
 * generic tool route.
 */
export const ACTION_ROUTE_RULES:
  readonly ActionRouteRule[] = [
  {
    kind: "provider",
    target: "web-search",
    keywords: [
      "search",
      "browse",
    ],
  },
  {
    kind: "provider",
    target: "web-content",
    keywords: [
      "fetch",
      "open source",
      "open page",
      "open the source page",
      "read source",
      "retrieve page",
    ],
  },
  {
    kind: "tool",
    target: "tool",
    keywords: [
      "send",
      "create",
      "update",
      "delete",
    ],
  },
  {
    kind: "internal",
    target: "cognitive",
    keywords: [
      "review",
      "prepare",
      "analyze",
      "plan",
    ],
  },
];

function keywordMatches(
  normalizedAction: string,
  keyword: string
): boolean {
  const normalizedKeyword =
    keyword.trim().toLowerCase();

  if (!normalizedKeyword) {
    return false;
  }

  if (
    normalizedKeyword.includes(" ")
  ) {
    return normalizedAction.includes(
      normalizedKeyword
    );
  }

  const escapedKeyword =
    normalizedKeyword.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  return new RegExp(
    `\\b${escapedKeyword}\\b`
  ).test(
    normalizedAction
  );
}

export function findActionRouteRule(
  action: string
): ActionRouteRule | null {
  const normalized =
    action.trim().toLowerCase();

  if (!normalized) {
    return null;
  }

  return (
    ACTION_ROUTE_RULES.find(
      (
        rule
      ) =>
        rule.keywords.some(
          (
            keyword
          ) =>
            keywordMatches(
              normalized,
              keyword
            )
        )
    ) ??
    null
  );
}
