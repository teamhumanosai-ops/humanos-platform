import {
  getActionCapability,
} from "./capabilities";

import type {
  RuntimeServices,
} from "../runtime/runtimeServices";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 capability provenance verification failed: ${message}`
    );
  }
}

const services = {
  searchWeb: async (
    query: string
  ) => ({
    query,
    answer: `Search result for ${query}`,
    results: [],
    searchedAt: new Date().toISOString(),
    provenance: {
      observedProviders: ["tavily"],
      requiredProviders: ["tavily"],
      dualProviderResultCount: 0,
      dualProviderCoverage: 0,
    },
  }),
  fetchWebContent: async (
    url: string
  ) => ({
    url,
    title: "Legacy source",
    text: "Legacy content",
    status: 200,
    contentType: "text/html",
    fetchedAt: new Date().toISOString(),
  }),
  fetchWebContentViaFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Firecrawl source",
    text: "Firecrawl content",
    status: 200,
    contentType: "text/markdown",
    fetchedAt: new Date().toISOString(),
  }),
  scrapeFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Firecrawl source",
    markdown: "Firecrawl content",
    status: 200,
    contentType: "text/markdown",
    fetchedAt: new Date().toISOString(),
  }),
  aiService: {} as RuntimeServices["aiService"],
} as RuntimeServices;

const webSearch =
  getActionCapability(
    "web-search"
  );

assert(
  webSearch !==
    null,
  "web-search must remain registered as a real capability"
);

const searchResult =
  await webSearch!.execute(
    "Find the latest status",
    services
  );

assert(
  searchResult.summary.includes(
    "Search result for Find the latest status"
  ),
  "web-search must return the provider-backed result"
);

assert(
  searchResult.metadata?.capabilityTarget ===
    "web-search",
  "web-search result must preserve capability provenance"
);

assert(
  searchResult.metadata?.providers ===
    "tavily",
  "web-search result must preserve observed provider provenance"
);

const webContent =
  getActionCapability(
    "web-content"
  );

assert(
  webContent !==
    null,
  "web-content must remain registered as a real capability"
);

const contentResult =
  await webContent!.execute(
    "Open https://example.com/source",
    services
  );

assert(
  contentResult.metadata?.provider ===
    "firecrawl",
  "web-content must preserve Firecrawl provider provenance"
);

assert(
  contentResult.metadata?.capabilityTarget ===
    "web-content",
  "web-content result must preserve capability provenance"
);

console.log(
  "ATR-001 capability provider provenance verification passed."
);
