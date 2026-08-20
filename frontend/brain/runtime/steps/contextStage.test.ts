import {
  createBrainState,
} from "../../brainState";

import {
  ContextStage,
} from "./contextStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `UCI-002 context verification failed: ${message}`
    );
  }
}

async function verifyContentIntegration(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Compare the current sources"
    );

  state.citations = [
    {
      index: 1,
      title: "Current source",
      url: "https://example.com/current",
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
      title: "Independent source",
      url: "https://another.example/source",
      domain: "another.example",
      providers: [
        "tavily",
      ],
    },
  ];

  const stage =
    new ContextStage();

  await stage.execute(
    state
  );

  assert(
    state.contentIntelligence !==
      null,
    "ContextStage must persist content intelligence"
  );

  assert(
    state.contentIntelligence?.sourceCount ===
      2,
    "content intelligence must count the available sources"
  );

  assert(
    state.contentIntelligence?.providerCount ===
      2,
    "content intelligence must expose provider coverage"
  );

  assert(
    state.contentIntelligence?.crossProviderAgreementCount ===
      1,
    "content intelligence must expose cross-provider agreement"
  );

  assert(
    state.context?.includes(
      "Providers represented: 2"
    ) === true,
    "provider coverage must be available to downstream context"
  );

  assert(
    state.context?.includes(
      "Cross-provider agreement: 1"
    ) === true,
    "provider agreement must be available to downstream context"
  );

  assert(
    state.context?.includes(
      "Providers: tavily, firecrawl"
    ) === true,
    "source-level provider provenance must be available"
  );

  assert(
    state.executedStages.includes(
      "Context"
    ),
    "context stage execution must remain observable"
  );
}

await verifyContentIntegration();

console.log(
  "UCI-002 context integration verification passed."
);
