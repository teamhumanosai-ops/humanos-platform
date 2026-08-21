import {
  getActionCapability,
  hasActionCapability,
} from "./capabilities";

import {
  clearActionTools,
  registerActionTool,
} from "./toolCapabilities";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-002 capability verification failed: ${message}`
    );
  }
}

const services = {
  searchWeb: async (
    query: string
  ) => ({
    query,
    answer:
      `Search result for ${query}`,
    results: [],
    searchedAt:
      new Date().toISOString(),
  }),
  fetchWebContent: async (
    url: string
  ) => ({
    url,
    title:
      "Test source",
    text:
      "Test source content",
    status:
      200,
    contentType:
      "text/html",
    fetchedAt:
      new Date().toISOString(),
  }),
  fetchWebContentViaFirecrawl: async (
    url: string
  ) => ({
    url,
    title:
      "Firecrawl test source",
    text:
      "Firecrawl test source content",
    status:
      200,
    contentType:
      "text/markdown",
    fetchedAt:
      new Date().toISOString(),
  }),
  scrapeFirecrawl: async (
    url: string
  ) => ({
    url,
    title:
      "Firecrawl raw test source",
    markdown:
      "Firecrawl raw test source content",
    status:
      200,
    contentType:
      "text/markdown",
    fetchedAt:
      new Date().toISOString(),
  }),
  aiService: async (
    _systemContext: string,
    messages: Array<{
      role: "user" | "assistant";
      message: string;
    }>
  ) =>
    `Cognitive result: ${messages[0]?.message ?? ""}`,
};

assert(
  hasActionCapability("web-search"),
  "web-search must be explicitly registered"
);

assert(
  hasActionCapability("web-content"),
  "web-content must have a concrete execution capability"
);

assert(
  hasActionCapability("cognitive"),
  "cognitive execution must be explicitly registered"
);

assert(
  hasActionCapability("tool"),
  "tool execution must use the explicit capability boundary"
);

assert(
  getActionCapability("web-search") !== null,
  "registered web-search capability must resolve"
);

assert(
  getActionCapability("web-content") !== null,
  "registered web-content capability must resolve"
);

assert(
  getActionCapability("unknown") === null,
  "unknown capabilities must resolve to null"
);

const webSearchCapability =
  getActionCapability(
    "web-search"
  );

if (webSearchCapability) {
  assert(
    webSearchCapability.integrations.length ===
      2,
    "web-search must declare both required provider integrations"
  );

  assert(
    webSearchCapability.integrations[0]?.provider ===
      "tavily" &&
    webSearchCapability.integrations[1]?.provider ===
      "firecrawl",
    "web-search must preserve Tavily and Firecrawl provider boundaries"
  );

  const result =
    await webSearchCapability.execute(
      "Human OS",
      services
    );

  assert(
    result.summary.includes(
      "Search result for Human OS"
    ),
    "web-search capability must return the provider result"
  );

  assert(
    result.metadata?.capabilityTarget ===
      "web-search",
    "web-search result must preserve capability provenance"
  );

  assert(
    result.metadata?.integrationProviders ===
      "tavily,firecrawl",
    "web-search result must expose provider provenance"
  );

  assert(
    result.metadata?.integrationOperations ===
      "tavily:search,firecrawl:search",
    "web-search result must expose operation provenance"
  );
}

const webContentCapability =
  getActionCapability(
    "web-content"
  );

if (webContentCapability) {
  const result =
    await webContentCapability.execute(
      "Fetch https://example.com",
      services
    );

  assert(
    result.summary.includes(
      "Test source content"
    ),
    "web-content capability must return provider content"
  );

  assert(
    result.metadata?.capabilityTarget ===
      "web-content",
    "web-content result must preserve capability provenance"
  );

  assert(
    result.metadata?.integrationProviders ===
      "firecrawl",
    "web-content result must expose provider provenance"
  );

  assert(
    result.metadata?.integrationOperations ===
      "firecrawl:fetch",
    "web-content result must expose operation provenance"
  );
}

const cognitiveCapability =
  getActionCapability(
    "cognitive"
  );

if (cognitiveCapability) {
  const result =
    await cognitiveCapability.execute(
      "Summarize the Human OS architecture",
      services
    );

  assert(
    result.summary ===
      "Cognitive result: Summarize the Human OS architecture",
    "cognitive capability must return the AI provider result"
  );

  assert(
    result.metadata?.capabilityTarget ===
      "cognitive",
    "cognitive result must preserve capability provenance"
  );
}

clearActionTools();

registerActionTool({
  id: "test-tool",
  description: "Test action tool",
  execute: async (action) => ({
    summary: `Tool result: ${action}`,
  }),
});

const toolCapability =
  getActionCapability("tool");

if (toolCapability) {
  const result =
    await toolCapability.execute(
      "tool:test-tool:run verification",
      services
    );

  assert(
    result.summary ===
      "Tool result: run verification",
    "tool capability must return the registered tool result"
  );

  assert(
    result.metadata?.capabilityTarget ===
      "tool",
    "tool result must preserve capability provenance"
  );
}

clearActionTools();

console.log(
  "ATR-002 capability verification passed."
);
