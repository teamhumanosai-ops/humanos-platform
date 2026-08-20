import {
  applyContentEvidenceQuality,
} from "./reasoning";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Content reasoning verification failed: ${message}`
    );
  }
}

const observation = {
  statement:
    "Current information supports the request.",
  confidence: 0.95,
  relevance: 0.9,
  source:
    "live_knowledge" as const,
  kind:
    "known_fact" as const,
};

const adjusted =
  applyContentEvidenceQuality(
    [observation],
    {
      sourceCount: 2,
      uniqueDomainCount: 2,
      providerCount: 2,
      crossProviderAgreementCount: 1,
      evidenceReadyCount: 2,
      evidenceReadyRatio: 1,
      agreementCoverage: 0.5,
      averageFreshness: 0.9,
      averageCompleteness: 1,
      averageEvidenceQuality: 0.9,
      bestEvidenceIndex: 1,
      sourceProfiles: [],
    }
  );

assert(
  adjusted[0].confidence <
    observation.confidence,
  "content quality weighting must prevent raw live-web confidence from passing through unchanged"
);

assert(
  adjusted[0].confidence >
    0.2,
  "quality weighting must preserve useful evidence confidence"
);

const lowQuality =
  applyContentEvidenceQuality(
    [observation],
    {
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
    }
  );

assert(
  lowQuality[0].kind ===
    "uncertainty",
  "low-quality live evidence must become explicit uncertainty"
);

assert(
  lowQuality[0].confidence >=
    0.2,
  "confidence must remain bounded"
);

const unchanged =
  applyContentEvidenceQuality(
    [
      {
        ...observation,
        source: "memory",
      },
    ],
    {
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
    }
  );

assert(
  unchanged[0].confidence ===
    observation.confidence,
  "non-web reasoning evidence must remain unchanged"
);

console.log(
  "Content reasoning verification passed."
);
