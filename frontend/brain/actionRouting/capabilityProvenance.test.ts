import {
  getActionCapability,
} from "./capabilities";

import {
  clearActionTools,
  registerActionTool,
} from "./toolCapabilities";

import type {
  RuntimeServices,
} from "../runtime/runtimeServices";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-002 capability provenance verification failed: ${message}`
    );
  }
}

const services = {
  searchWeb: async () => ({
    query: "test query",
    answer: "combined answer",
    results: [],
    searchedAt:
      "2026-08-19T00:00:00.000Z",
    provenance: {
      requiredProviders: [
        "tavily",
        "firecrawl",
      ],
      observedProviders: [
        "tavily",
        "firecrawl",
      ],
      resultCount: 2,
      dualProviderResultCount: 1,
      dualProviderCoverage: 0.5,
    },
  }),

  fetchWebContent: async (
    url: string
  ) => ({
    url,
    title: "Test",
    text: "Test",
    status: 200,
    contentType: "text/html",
    fetchedAt:
      "2026-08-19T00:00:00.000Z",
  }),

  fetchWebContentViaFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Test",
    text: "Test",
    status: 200,
    contentType: "text/markdown",
    fetchedAt:
      "2026-08-19T00:00:00.000Z",
  }),

  scrapeFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Test",
    markdown: "Test",
    status: 200,
    contentType: "text/markdown",
    fetchedAt:
      "2026-08-19T00:00:00.000Z",
  }),

  aiService:
    {} as RuntimeServices["aiService"],
} as RuntimeServices;

const webSearch =
  getActionCapability(
    "web-search"
  );

assert(
  webSearch !== null,
  "web-search capability must be registered"
);

const searchResult =
  await webSearch!.execute(
    "test query",
    services
  );

assert(
  searchResult.metadata?.providers ===
    "tavily,firecrawl",
  "web-search execution must preserve observed providers"
);

assert(
  searchResult.metadata?.dualProviderCoverage ===
    "0.5",
  "web-search execution must preserve dual-provider coverage"
);

clearActionTools();

registerActionTool({
  id: "provenance-test",
  async execute(action) {
    return {
      summary:
        `Tool result: ${action}`,
      metadata: {
        custom: "preserved",
      },
    };
  },
});

const tool =
  getActionCapability(
    "tool"
  );

const toolResult =
  await tool!.execute(
    "provenance-test:run",
    services
  );

assert(
  toolResult.metadata?.toolId ===
    "provenance-test",
  "tool execution must identify the registered tool"
);

assert(
  toolResult.metadata?.toolAction ===
    "run",
  "tool execution must preserve the concrete tool action"
);

assert(
  toolResult.metadata?.custom ===
    "preserved",
  "existing tool metadata must remain intact"
);

clearActionTools();

console.log(
  "ATR-002 capability provenance verification passed."
);
