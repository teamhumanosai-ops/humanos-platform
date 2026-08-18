import {
  analyzeContentSources,
} from "./engine";

import type {
  CitationSource,
} from "../websearch/citations";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `UCI-004 content intelligence verification failed: ${message}`
    );
  }
}

const citations: CitationSource[] = [
  {
    index: 1,
    title: "Example article",
    url: "https://example.com/article",
    domain: "example.com",
    publishedDate:
      new Date().toISOString(),
    providers: [
      "tavily",
      "firecrawl",
    ],
  },
  {
    index: 2,
    title: "Example source",
    url: "https://another.example/source",
    domain: "another.example",
    providers: [
      "tavily",
    ],
  },
];

const intelligence =
  analyzeContentSources(
    citations
  );

assert(
  intelligence.sourceCount ===
    2,
  "source count must match citations"
);

assert(
  intelligence.uniqueDomainCount ===
    2,
  "unique domain count must be deterministic"
);

assert(
  intelligence.providerCount ===
    2,
  "provider count must include independent providers"
);

assert(
  intelligence.crossProviderAgreementCount ===
    1,
  "cross-provider agreement must count sources supported by multiple providers"
);

assert(
  intelligence.sourceProfiles.length ===
    2,
  "every citation must receive a source profile"
);

assert(
  intelligence.sourceProfiles[0]
    .sourceType ===
    "news",
  "published sources must be classified as news"
);

assert(
  intelligence.sourceProfiles[1]
    .sourceType ===
    "web",
  "sources without publication dates must remain web sources"
);

assert(
  intelligence.sourceProfiles[0]
    .providerAgreement ===
    true,
  "multi-provider sources must expose agreement"
);

assert(
  intelligence.sourceProfiles[1]
    .providerAgreement ===
    false,
  "single-provider sources must not claim agreement"
);

assert(
  intelligence.sourceProfiles[0]
    .providers.length ===
    2,
  "source profiles must preserve provider provenance"
);

assert(
  intelligence.sourceProfiles[0]
    .evidenceReady ===
    true,
  "complete sources must be evidence ready"
);

assert(
  intelligence.sourceProfiles[0]
    .evidenceQuality >
    intelligence.sourceProfiles[1]
      .evidenceQuality,
  "fresh, complete, multi-provider evidence must rank higher"
);

assert(
  intelligence.evidenceReadyCount ===
    2,
  "evidence-ready count must include complete sources"
);

assert(
  intelligence.evidenceReadyRatio ===
    1,
  "evidence-ready ratio must be normalized"
);

assert(
  intelligence.agreementCoverage ===
    0.5,
  "agreement coverage must be normalized by source count"
);

assert(
  intelligence.averageCompleteness >
    0,
  "completeness must be normalized into a useful range"
);

assert(
  intelligence.averageEvidenceQuality >
    0,
  "average evidence quality must be normalized"
);

assert(
  intelligence.bestEvidenceIndex ===
    1,
  "best evidence must point to the highest-quality source"
);

const empty =
  analyzeContentSources(
    []
  );

assert(
  empty.sourceCount ===
    0,
  "empty content must have zero sources"
);

assert(
  empty.providerCount ===
    0,
  "empty content must have zero providers"
);

assert(
  empty.crossProviderAgreementCount ===
    0,
  "empty content must have zero provider agreement"
);

assert(
  empty.evidenceReadyCount ===
    0,
  "empty content must have zero evidence-ready sources"
);

assert(
  empty.evidenceReadyRatio ===
    0,
  "empty content must have zero evidence-ready ratio"
);

assert(
  empty.agreementCoverage ===
    0,
  "empty content must have zero agreement coverage"
);

assert(
  empty.averageFreshness ===
    0,
  "empty content must have zero average freshness"
);

assert(
  empty.averageEvidenceQuality ===
    0,
  "empty content must have zero average evidence quality"
);

assert(
  empty.bestEvidenceIndex ===
    undefined,
  "empty content must not expose a best evidence index"
);

console.log(
  "UCI-004 content intelligence verification passed."
);
