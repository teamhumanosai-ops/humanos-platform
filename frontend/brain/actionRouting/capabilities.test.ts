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
  aiService:
    {} as never,
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

const webContentCapability =
  getActionCapability(
    "web-content"
  );

if (webContentCapability) {
  const result =
    await webContentCapability.execute(
      "Fetch https://example.com/source",
      services
    );

  assert(
    result.summary.includes(
      "Firecrawl test source content"
    ),
    "web-content capability must propagate Firecrawl content"
  );

  assert(
    result.metadata?.url ===
      "https://example.com/source",
    "web-content capability must preserve the fetched URL"
  );

  assert(
    result.metadata?.provider ===
      "firecrawl",
    "web-content capability must record the provider that executed the fetch"
  );
}

let missingContentUrlRejected =
  false;

if (webContentCapability) {
  try {
    await webContentCapability.execute(
      "Fetch the source page",
      services
    );
  } catch (error) {
    missingContentUrlRejected =
      error instanceof Error &&
      error.message.includes(
        "explicit HTTP or HTTPS URL"
      );
  }
}

assert(
  missingContentUrlRejected,
  "web-content execution must reject actions without an explicit URL"
);

let emptyFirecrawlContentRejected =
  false;

const emptyContentServices = {
  ...services,
  fetchWebContentViaFirecrawl: async (
    url: string
  ) => ({
    url,
    title:
      "Empty source",
    text:
      "   ",
    status:
      200,
    contentType:
      "text/markdown",
    fetchedAt:
      new Date().toISOString(),
  }),
};

if (webContentCapability) {
  try {
    await webContentCapability.execute(
      "Fetch https://example.com/empty",
      emptyContentServices
    );
  } catch (error) {
    emptyFirecrawlContentRejected =
      error instanceof Error &&
      error.message.includes(
        "no readable content"
      );
  }
}

assert(
  emptyFirecrawlContentRejected,
  "empty Firecrawl content must not be accepted as execution evidence"
);

clearActionTools();

registerActionTool({
  id: "test-tool",
  async execute(action) {
    return {
      summary:
        `Tool result: ${action}`,
      metadata: {
        toolId:
          "test-tool",
      },
    };
  },
});

const toolCapability =
  getActionCapability("tool");

assert(
  toolCapability !== null,
  "tool capability must resolve"
);

if (toolCapability) {
  const result =
    await toolCapability.execute(
      "test-tool:perform action",
      services
    );

  assert(
    result.summary ===
      "Tool result: perform action",
    "tool capability must delegate only the action payload"
  );

  assert(
    result.metadata?.toolId ===
      "test-tool",
    "tool metadata must identify the registered tool"
  );
}

let unknownToolRejected =
  false;

if (toolCapability) {
  try {
    await toolCapability.execute(
      "missing-tool:perform action",
      services
    );
  } catch {
    unknownToolRejected = true;
  }
}

assert(
  unknownToolRejected,
  "unknown tool ids must be rejected"
);

clearActionTools();
