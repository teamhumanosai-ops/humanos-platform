import {
  getActionCapability,
} from "./capabilities";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ATR web provenance verification failed: ${message}`);
  }
}

const capability = getActionCapability("web-search");
assert(capability !== null, "web-search capability must remain registered");

if (capability) {
  const result = await capability.execute(
    "search Human OS",
    {
      searchWeb: async () => ({
        query: "search Human OS",
        answer: "verified answer",
        results: [{ title: "result" }],
        searchedAt: "2026-08-19T00:00:00.000Z",
        provenance: {
          observedProviders: ["tavily", "firecrawl"],
          requiredProviders: ["tavily", "firecrawl"],
          dualProviderResultCount: 1,
          dualProviderCoverage: 1,
        },
      }),
    } as never
  );

  assert(
    result.metadata?.providers === "tavily,firecrawl",
    "web execution must preserve observed provider provenance"
  );

  assert(
    result.metadata?.requiredProviders === "tavily,firecrawl",
    "web execution must preserve required provider provenance"
  );

  assert(
    result.metadata?.dualProviderCoverage === "1",
    "web execution must preserve dual-provider coverage"
  );

  assert(
    result.metadata?.capabilityTarget === "web-search",
    "web execution must preserve capability provenance"
  );
}

console.log("ATR web search provenance verification passed.");
