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
  const result =
    await webSearchCapability.execute(
      "Search for Human OS",
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
}

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

  assert(
    result.metadata?.capabilityTarget ===
      "web-content",
    "web-content result must preserve capability provenance"
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

const cognitiveCapability =
  getActionCapability(
    "cognitive"
  );

assert(
  cognitiveCapability !== null,
  "cognitive capability must resolve"
);

if (cognitiveCapability) {
  const result =
    await cognitiveCapability.execute(
      "Analyze the current action plan",
      services
    );

  assert(
    result.summary ===
      "Cognitive result: Analyze the current action plan",
    "cognitive capability must return the real AI service result"
  );

  assert(
    result.metadata?.executionType ===
      "cognitive-ai",
    "cognitive execution must identify its execution type"
  );

  assert(
    result.metadata?.providerBoundary ===
      "aiService",
    "cognitive execution must preserve the provider service boundary"
  );

  assert(
    result.metadata?.capabilityTarget ===
      "cognitive",
    "cognitive result must preserve capability provenance"
  );
}

let emptyCognitiveActionRejected =
  false;

if (cognitiveCapability) {
  try {
    await cognitiveCapability.execute(
      "   ",
      services
    );
  } catch (error) {
    emptyCognitiveActionRejected =
      error instanceof Error &&
      error.message.includes(
        "non-empty action"
      );
  }
}

assert(
  emptyCognitiveActionRejected,
  "cognitive execution must reject empty actions"
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

  assert(
    result.metadata?.executionType ===
      "registered-tool",
    "tool execution must identify the registered tool execution type"
  );

  assert(
    result.metadata?.capabilityTarget ===
      "tool",
    "tool result must preserve capability provenance"
  );

  const explicitResult =
    await toolCapability.execute(
      "tool:test-tool:perform explicit action",
      services
    );

  assert(
    explicitResult.summary ===
      "Tool result: perform explicit action",
    "tool capability must support explicit tool execution syntax"
  );
}

let emptyToolResultRejected =
  false;

clearActionTools();

registerActionTool({
  id: "empty-result-tool",
  async execute() {
    return {
      summary:
        "   ",
    };
  },
});

if (toolCapability) {
  try {
    await toolCapability.execute(
      "empty-result-tool:perform action",
      services
    );
  } catch (error) {
    emptyToolResultRejected =
      error instanceof Error &&
      error.message.includes(
        "returned an empty execution result"
      );
  }
}

assert(
  emptyToolResultRejected,
  "tool capabilities must reject empty execution evidence"
);

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
