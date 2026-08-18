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
      `UCI-001 context verification failed: ${message}`
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
      1,
    "content intelligence must count the available sources"
  );

  assert(
    state.context?.includes(
      "CONTENT INTELLIGENCE:"
    ) === true,
    "content intelligence metadata must be available to downstream context"
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
  "UCI-001 context integration verification passed."
);
