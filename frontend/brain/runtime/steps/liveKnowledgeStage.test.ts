import {
  createBrainState,
} from "../../brainState";

import {
  Intent,
} from "../../intent";

import {
  LiveKnowledgeStage,
} from "./liveKnowledgeStage";

import type {
  RuntimeServices,
} from "../runtimeServices";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `LiveKnowledge provider boundary verification failed: ${message}`
    );
  }
}

const successfulSearch =
  async () => ({
    query: "latest Human OS status",
    answer: "Current evidence is available.",
    searchedAt: new Date().toISOString(),
    results: [
      {
        title: "Primary evidence",
        url: "https://example.com/primary",
        snippet: "Current evidence snippet.",
        providers: [
          "tavily",
          "firecrawl",
        ],
      },
    ],
    provenance: {
      requiredProviders: [
        "tavily",
        "firecrawl",
      ],
      observedProviders: [
        "tavily",
        "firecrawl",
      ],
      resultCount: 1,
      dualProviderResultCount: 1,
      dualProviderCoverage: 1,
    },
  });

const successfulServices = {
  aiService: async () => "ok",
  searchWeb: successfulSearch,
  fetchWebContent: async () => {
    throw new Error("not used");
  },
  fetchWebContentViaFirecrawl: async () => {
    throw new Error("not used");
  },
  scrapeFirecrawl: async () => {
    throw new Error("not used");
  },
} as unknown as RuntimeServices;

const successState =
  createBrainState(
    "conversation",
    [],
    "latest Human OS status"
  );

successState.intent =
  Intent.LIVE_SEARCH;

await new LiveKnowledgeStage(
  successfulServices
).execute(successState);

assert(
  successState.errors.length === 0,
  "successful dual-provider search must not create runtime errors"
);

assert(
  successState.liveKnowledge.length === 1,
  "successful search must populate live knowledge"
);

assert(
  successState.citations.length === 1,
  "successful search must preserve citation evidence"
);

assert(
  successState.contentIntelligence !== null,
  "successful search must populate content intelligence"
);

const tavilyFailureServices = {
  ...successfulServices,
  searchWeb: async () => {
    throw new Error("Tavily web search failed (503)");
  },
} as unknown as RuntimeServices;

const tavilyFailureState =
  createBrainState(
    "conversation",
    [],
    "latest Human OS status"
  );

tavilyFailureState.intent =
  Intent.LIVE_SEARCH;

await new LiveKnowledgeStage(
  tavilyFailureServices
).execute(tavilyFailureState);

assert(
  tavilyFailureState.liveKnowledge.length === 0,
  "provider failure must not leave stale live knowledge"
);

assert(
  tavilyFailureState.citations.length === 0,
  "provider failure must clear citations"
);

assert(
  tavilyFailureState.contentIntelligence === null,
  "provider failure must clear content intelligence"
);

assert(
  tavilyFailureState.errors.some(
    (error) =>
      error.includes(
        "LiveKnowledge: Tavily web search failed (503)"
      )
  ),
  "provider failure must be preserved in BrainState errors"
);

assert(
  tavilyFailureState.response?.includes(
    "couldn't retrieve current web information"
  ) === true,
  "provider failure must produce the canonical live-knowledge response"
);

const firecrawlFailureServices = {
  ...successfulServices,
  searchWeb: async () => {
    throw new Error(
      "Firecrawl web search failed (429)"
    );
  },
} as unknown as RuntimeServices;

const firecrawlFailureState =
  createBrainState(
    "conversation",
    [],
    "latest Human OS status"
  );

firecrawlFailureState.intent =
  Intent.LIVE_SEARCH;

await new LiveKnowledgeStage(
  firecrawlFailureServices
).execute(firecrawlFailureState);

assert(
  firecrawlFailureState.errors.some(
    (error) =>
      error.includes(
        "LiveKnowledge: Firecrawl web search failed (429)"
      )
  ),
  "Firecrawl failure must be preserved at the runtime provider boundary"
);

const nonLiveState =
  createBrainState(
    "conversation",
    [],
    "remember this"
  );

const nonLiveServices = {
  ...successfulServices,
  searchWeb: async () => {
    throw new Error(
      "searchWeb must not execute for non-live intent"
    );
  },
} as unknown as RuntimeServices;

await new LiveKnowledgeStage(
  nonLiveServices
).execute(nonLiveState);

assert(
  nonLiveState.liveKnowledge.length === 0,
  "non-live requests must bypass live web execution"
);

assert(
  nonLiveState.errors.length === 0,
  "non-live requests must not create provider errors"
);

console.log(
  "LiveKnowledge provider boundary verification passed."
);
