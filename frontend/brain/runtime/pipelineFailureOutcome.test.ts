import {
  createBrainState,
} from "./createBrainState";

import {
  CognitiveRuntime,
} from "./pipeline";

import type {
  RuntimeServices,
} from "./runtimeServices";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Runtime failure-outcome verification failed: ${message}`
    );
  }
}

const services = {
  searchWeb: async (
    query: string
  ) => ({
    query,
    answer: null,
    results: [],
    searchedAt:
      new Date().toISOString(),
  }),

  fetchWebContent: async (
    url: string
  ) => ({
    url,
    title: "Test",
    text: "Test",
    status: 200,
    contentType: "text/html",
    fetchedAt:
      new Date().toISOString(),
  }),

  fetchWebContentViaFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Test",
    text: "Test",
    status: 200,
    contentType: "text/markdown",
    fetchedAt:
      new Date().toISOString(),
  }),

  scrapeFirecrawl: async (
    url: string
  ) => ({
    url,
    title: "Test",
    markdown: "Test",
    status: 200,
    contentType: "text/markdown",
    fetchedAt:
      new Date().toISOString(),
  }),

  aiService:
    {} as RuntimeServices["aiService"],
} as RuntimeServices;

const runtime =
  new CognitiveRuntime(
    services
  );

const firstStage =
  runtime.getStages()[0];

assert(
  firstStage !== undefined,
  "canonical runtime must expose its first stage"
);

const originalExecute =
  firstStage!.execute.bind(
    firstStage
  );

firstStage!.execute =
  async () => {
    throw new Error(
      "simulated input failure"
    );
  };

const state =
  createBrainState(
    "conversation",
    [],
    "Failure recovery verification"
  );

const result =
  await runtime.execute(
    state
  );

assert(
  result.runtimeStatus ===
    "failed",
  "the original stage failure must remain visible"
);

assert(
  result.errors.some(
    (error) =>
      error.includes(
        "simulated input failure"
      )
  ),
  "the original stage failure must be preserved"
);

assert(
  result.outcome !==
    null,
  "the terminal Outcome stage must materialize after an earlier failure"
);

assert(
  result.executedStages.at(-1) ===
    "Outcome",
  "Outcome must be the final executed stage during failure recovery"
);

firstStage!.execute =
  originalExecute;

console.log(
  "Runtime failure-outcome verification passed."
);
