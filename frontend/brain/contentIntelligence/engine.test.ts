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
      `UCI-001 content intelligence verification failed: ${message}`
    );
  }
}

const citations: CitationSource[] = [
  {
    index: 1,
    title: "Example article",
    url: "https://example.com/article",
    domain: "example.com",
    publishedDate: new Date().toISOString(),
  },
  {
    index: 2,
    title: "Example source",
    url: "https://another.example/source",
    domain: "another.example",
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
    .evidenceReady ===
    true,
  "complete sources must be evidence ready"
);

assert(
  intelligence.averageCompleteness >
    0,
  "completeness must be normalized into a useful range"
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
  empty.averageFreshness ===
    0,
  "empty content must have zero average freshness"
);

console.log(
  "UCI-001 content intelligence verification passed."
);
