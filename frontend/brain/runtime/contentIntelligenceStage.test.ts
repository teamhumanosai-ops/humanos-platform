import {
  createBrainState,
} from "../brainState";

import {
  Intent,
} from "../intent";

import {
  LiveKnowledgeStage,
} from "./steps/liveKnowledgeStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `UCI-005 runtime content intelligence verification failed: ${message}`
    );
  }
}

async function verifyLiveKnowledgeBuildsContentIntelligence(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "What is the latest Human OS news?"
    );

  state.intent =
    Intent.LIVE_SEARCH;

  const stage =
    new LiveKnowledgeStage({
      aiService: undefined as never,

      searchWeb: async () => ({
        query: "Human OS latest",

        answer:
          "Current evidence is available.",

        results: [
          {
            title: "Current source",

            url:
              "https://example.com/current",

            snippet:
              "Current evidence.",

            publishedDate:
              new Date().toISOString(),

            providers: [
              "tavily",
              "firecrawl",
            ],
          },
        ],

        searchedAt:
          new Date().toISOString(),
      }),
    });

  const result =
    await stage.run(
      state
    );

  assert(
    result.contentIntelligence !==
      null,
    "live knowledge must populate content intelligence"
  );

  assert(
    result.contentIntelligence?.sourceCount ===
      1,
    "content intelligence must reflect live search sources"
  );

  assert(
    result.contentIntelligence?.providerCount ===
      2,
    "content intelligence must preserve both providers"
  );

  assert(
    result.contentIntelligence?.crossProviderAgreementCount ===
      1,
    "content intelligence must preserve cross-provider agreement"
  );

  assert(
    result.contentIntelligence?.evidenceReadyCount ===
      1,
    "complete live evidence must be marked evidence-ready"
  );

  assert(
    result.contentIntelligence?.bestEvidenceIndex ===
      1,
    "best evidence must point to the strongest live source"
  );
}

async function verifySearchFailureClearsContentIntelligence(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "What is current?"
    );

  state.intent =
    Intent.LIVE_SEARCH;

  state.contentIntelligence = {
    sourceCount: 1,
    uniqueDomainCount: 1,
    providerCount: 1,
    crossProviderAgreementCount: 0,
    evidenceReadyCount: 1,
    evidenceReadyRatio: 1,
    agreementCoverage: 0,
    averageFreshness: 1,
    averageCompleteness: 1,
    averageEvidenceQuality: 1,
    bestEvidenceIndex: 1,
    sourceProfiles: [],
  };

  const stage =
    new LiveKnowledgeStage({
      aiService: undefined as never,

      searchWeb: async () => {
        throw new Error(
          "search unavailable"
        );
      },
    });

  const result =
    await stage.run(
      state
    );

  assert(
    result.contentIntelligence ===
      null,
    "failed live search must clear stale content intelligence"
  );
}

async function runVerification(): Promise<void> {
  await verifyLiveKnowledgeBuildsContentIntelligence();
  await verifySearchFailureClearsContentIntelligence();

  console.log(
    "UCI-005 runtime content intelligence verification passed."
  );
}

void runVerification();
