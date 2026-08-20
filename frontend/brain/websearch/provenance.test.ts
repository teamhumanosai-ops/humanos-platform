import {
  buildSearchProvenance,
} from "./provenance";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `PROV-003 provenance verification failed: ${message}`
    );
  }
}

const provenance =
  buildSearchProvenance([
    {
      title: "Shared source",
      url: "https://example.com/shared",
      snippet: "shared",
      providers: [
        "tavily",
        "firecrawl",
      ],
    },
    {
      title: "Tavily source",
      url: "https://example.com/tavily",
      snippet: "tavily",
      providers: [
        "tavily",
      ],
    },
    {
      title: "Firecrawl source",
      url: "https://example.com/firecrawl",
      snippet: "firecrawl",
      providers: [
        "firecrawl",
      ],
    },
  ]);

assert(
  provenance.requiredProviders.length === 2,
  "two required providers must be declared"
);

assert(
  provenance.observedProviders.length === 2,
  "observed providers must be deduplicated"
);

assert(
  provenance.resultCount === 3,
  "result count must match normalized results"
);

assert(
  provenance.dualProviderResultCount === 1,
  "only the shared source should be dual-provider"
);

assert(
  provenance.dualProviderCoverage === 1 / 3,
  "dual-provider coverage must be deterministic"
);

const empty =
  buildSearchProvenance([]);

assert(
  empty.dualProviderCoverage === 0,
  "empty evidence must have zero dual-provider coverage"
);

console.log(
  "PROV-003 web evidence provenance verification passed."
);
