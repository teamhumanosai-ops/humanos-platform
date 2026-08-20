import {
  buildCitationSources,
} from "./citations";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `PROV-003 citation verification failed: ${message}`
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
        "tavily",
      ],
    },
    {
      title: "Single provider",
      url: "https://example.org/source",
      providers: [
        "tavily",
      ],
    },
    {
      title: "Unattributed source",
      url: "https://example.net/source",
    },
  ]);

assert(
  citations.length === 3,
  "citation count must match search results"
);

assert(
  citations[0].providers?.length === 2,
  "citation providers must be deduplicated"
);

assert(
  citations[0].providerCount === 2,
  "provider count must reflect independent providers"
);

assert(
  citations[0].dualSourced === true,
  "two-provider citation must be marked dual-sourced"
);

assert(
  citations[1].providerCount === 1,
  "single-provider citation must report one provider"
);

assert(
  citations[1].dualSourced === false,
  "single-provider citation must not be marked dual-sourced"
);

assert(
  citations[2].providerCount === 0,
  "missing provider metadata must be represented as zero"
);

assert(
  citations[2].dualSourced === false,
  "unattributed citation must not be marked dual-sourced"
);

assert(
  citations[0].domain ===
    "example.com",
  "citation domain normalization must remain deterministic"
);

console.log(
  "PROV-003 citation evidence verification passed."
);
