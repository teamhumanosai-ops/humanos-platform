import {
  createBrainState,
} from "../../brainState";

import {
  ReasoningStage,
} from "./reasoningStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Reasoning content intelligence verification failed: ${message}`
    );
  }
}

async function runVerification(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "What is the current runtime status?"
    );

  state.liveKnowledge = [
    "Current runtime status is healthy.",
  ];

  state.contentIntelligence = {
    sourceCount: 1,
    uniqueDomainCount: 1,
    providerCount: 1,
    crossProviderAgreementCount: 0,
    evidenceReadyCount: 0,
    evidenceReadyRatio: 0,
    agreementCoverage: 0,
    averageFreshness: 0,
    averageCompleteness: 0,
    averageEvidenceQuality: 0,
    sourceProfiles: [],
  };

  const result =
    await new ReasoningStage().execute(
      state
    );

  const liveObservation =
    result.reasoningObservations.find(
      (observation) =>
        observation.source ===
        "live_knowledge"
    );

  assert(
    Boolean(liveObservation),
    "live web evidence must remain represented in reasoning"
  );

  assert(
    liveObservation?.kind ===
      "uncertainty",
    "low-quality web evidence must become explicit uncertainty"
  );

  assert(
    result.reasoningConfidence <
      0.95,
    "reasoning confidence must reflect content evidence quality"
  );

  assert(
    result.diagnostics.some(
      (diagnostic) =>
        diagnostic.stage ===
          "Reasoning" &&
        diagnostic.success
    ),
    "reasoning execution must retain successful diagnostics"
  );

  console.log(
    "Reasoning content intelligence verification passed."
  );
}

void runVerification();
