import {
  buildCitationSources,
} from "./citations";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `UCI-002 citation verification failed: ${message}`
    );
  }
}

const citations =
  buildCitationSources([
    {
      title: "Shared source",
      url: "https://example.com/shared",
      publishedDate:
        new Date().toISOString(),
      providers: [
        "tavily",
        "firecrawl",
      ],
    },
    {
      title: "Single provider",
      url: "https://example.org/source",
      providers: [
        "tavily",
      ],
    },
  ]);

assert(
  citations.length ===
    2,
  "citation count must match search results"
);

assert(
  citations[0].providers?.length ===
    2,
  "citation must preserve independent provider provenance"
);

assert(
  citations[0].providers?.includes(
    "tavily"
  ) === true,
  "citation must preserve Tavily provenance"
);

assert(
  citations[0].providers?.includes(
    "firecrawl"
  ) === true,
  "citation must preserve Firecrawl provenance"
);

assert(
  citations[1].providers?.length ===
    1,
  "single-provider citation must preserve one provider"
);

assert(
  citations[0].domain ===
    "example.com",
  "citation domain normalization must remain deterministic"
);

console.log(
  "UCI-002 citation provenance verification passed."
);
