import {
  addDocument,
  clearKnowledge,
} from "./store";

import {
  searchKnowledge,
} from "./search";

clearKnowledge();

addDocument({
  id: "human-os",
  title: "Human OS Retrieval",
  source: "human-os.md",
  createdAt: "2026-08-21T00:00:00.000Z",
  chunks: [
    {
      id: "human-os-1",
      documentId: "human-os",
      source: "human-os.md",
      index: 0,
      text: "Human OS uses memory retrieval to enrich cognitive context.",
    },
    {
      id: "human-os-2",
      documentId: "human-os",
      source: "human-os.md",
      index: 1,
      text: "Execution requires authorization and provider provenance.",
    },
  ],
});

const retrievalResults =
  searchKnowledge(
    "What memory retrieval enriches context?"
  );

if (
  retrievalResults.length === 0 ||
  retrievalResults[0]?.chunk.id !==
    "human-os-1"
) {
  throw new Error(
    "Keyword retrieval regression: relevant memory chunk was not ranked first."
  );
}

if (
  searchKnowledge("   ").length !== 0
) {
  throw new Error(
    "Keyword retrieval regression: blank query must return no results."
  );
}

clearKnowledge();

console.log(
  "Knowledge search regression verification passed."
);
