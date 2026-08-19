import {
  ACTION_ROUTE_RULES,
  findActionRouteRule,
} from "./registry";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 registry verification failed: ${message}`
    );
  }
}

assert(
  ACTION_ROUTE_RULES.length ===
    4,
  "the canonical registry must expose the expected bounded rule set"
);

const searchRule =
  findActionRouteRule(
    "Search the latest project status"
  );

assert(
  searchRule?.kind ===
    "provider",
  "search must resolve to a provider"
);

assert(
  searchRule?.target ===
    "web-search",
  "search must resolve to web-search"
);

const contentRule =
  findActionRouteRule(
    "Fetch the source page"
  );

assert(
  contentRule?.target ===
    "web-content",
  "fetch must resolve to web-content"
);

const toolRule =
  findActionRouteRule(
    "Create the requested task"
  );

assert(
  toolRule?.kind ===
    "tool" &&
    toolRule.target ===
      "tool",
  "tool actions must resolve to the tool boundary"
);

const internalRule =
  findActionRouteRule(
    "Review the next milestone"
  );

assert(
  internalRule?.kind ===
    "internal" &&
    internalRule.target ===
      "cognitive",
  "cognitive actions must remain internal"
);

assert(
  findActionRouteRule(
    "Do something ambiguous"
  ) === null,
  "unknown actions must not receive a route rule"
);

assert(
  findActionRouteRule(
    ""
  ) === null,
  "empty actions must remain unresolved"
);

assert(
  findActionRouteRule(
    "  SEARCH for evidence  "
  )?.target ===
    "web-search",
  "routing must normalize surrounding whitespace and case"
);
