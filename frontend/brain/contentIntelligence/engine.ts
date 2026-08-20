import type {
  CitationSource,
} from "../websearch/citations";

import type {
  ContentIntelligence,
  ContentSourceProfile,
  ContentSourceType,
} from "./types";

function clamp(
  value: number
): number {
  return Math.max(
    0,
    Math.min(
      1,
      value
    )
  );
}

function freshnessScore(
  publishedDate?: string
): number {
  if (!publishedDate) {
    return 0.5;
  }

  const timestamp =
    Date.parse(
      publishedDate
    );

  if (
    !Number.isFinite(timestamp)
  ) {
    return 0.25;
  }

  const ageDays =
    Math.max(
      0,
      (Date.now() - timestamp) /
        86_400_000
    );

  return clamp(
    1 -
      ageDays /
        365
  );
}

function sourceType(
  citation: CitationSource
): ContentSourceType {
  return citation.publishedDate
    ? "news"
    : "web";
}

function completenessScore(
  citation: CitationSource
): number {
  let score = 0;

  if (
    citation.title.trim()
  ) {
    score += 0.25;
  }

  if (
    citation.url.trim()
  ) {
    score += 0.25;
  }

  if (
    citation.domain.trim()
  ) {
    score += 0.25;
  }

  if (
    citation.publishedDate?.trim()
  ) {
    score += 0.25;
  }

  return score;
}

function providersFor(
  citation: CitationSource
): NonNullable<
  CitationSource["providers"]
> {
  return [
    ...new Set(
      citation.providers ?? []
    ),
  ];
}

function buildProfile(
  citation: CitationSource
): ContentSourceProfile {
  const freshness =
    freshnessScore(
      citation.publishedDate
    );

  const completeness =
    completenessScore(
      citation
    );

  const providers =
    providersFor(
      citation
    );

  const providerAgreement =
    providers.length > 1;

  const evidenceReady =
    Boolean(
      citation.title.trim() &&
      citation.url.trim() &&
      citation.domain.trim()
    );

  const evidenceQuality =
    clamp(
      freshness * 0.4 +
      completeness * 0.3 +
      (providerAgreement
        ? 0.2
        : 0) +
      (evidenceReady
        ? 0.1
        : 0)
    );

  return {
    index: citation.index,

    title: citation.title,

    url: citation.url,

    domain: citation.domain,

    sourceType:
      sourceType(citation),

    providers,

    providerAgreement,

    freshness,

    completeness,

    evidenceReady,

    evidenceQuality,
  };
}

export function analyzeContentSources(
  citations: CitationSource[]
): ContentIntelligence {
  const sourceProfiles =
    citations.map(
      buildProfile
    );

  const domains =
    new Set(
      sourceProfiles
        .map(
          (profile) =>
            profile.domain
              .trim()
              .toLowerCase()
        )
        .filter(Boolean)
    );

  const providers =
    new Set(
      sourceProfiles.flatMap(
        (profile) =>
          profile.providers
      )
    );

  const sourceCount =
    sourceProfiles.length;

  const evidenceReadyCount =
    sourceProfiles.filter(
      (profile) =>
        profile.evidenceReady
    ).length;

  const crossProviderAgreementCount =
    sourceProfiles.filter(
      (profile) =>
        profile.providerAgreement
    ).length;

  const averageFreshness =
    sourceCount === 0
      ? 0
      : sourceProfiles.reduce(
          (total, profile) =>
            total +
            profile.freshness,
          0
        ) /
        sourceCount;

  const averageCompleteness =
    sourceCount === 0
      ? 0
      : sourceProfiles.reduce(
          (total, profile) =>
            total +
            profile.completeness,
          0
        ) /
        sourceCount;

  const averageEvidenceQuality =
    sourceCount === 0
      ? 0
      : sourceProfiles.reduce(
          (total, profile) =>
            total +
            profile.evidenceQuality,
          0
        ) /
        sourceCount;

  const bestEvidenceProfile =
    sourceProfiles.reduce<
      ContentSourceProfile | undefined
    >(
      (best, profile) =>
        !best ||
        profile.evidenceQuality >
          best.evidenceQuality
          ? profile
          : best,
      undefined
    );

  return {
    sourceCount,

    uniqueDomainCount:
      domains.size,

    providerCount:
      providers.size,

    crossProviderAgreementCount,

    evidenceReadyCount,

    evidenceReadyRatio:
      sourceCount === 0
        ? 0
        : evidenceReadyCount /
          sourceCount,

    agreementCoverage:
      sourceCount === 0
        ? 0
        : crossProviderAgreementCount /
          sourceCount,

    averageFreshness,

    averageCompleteness,

    averageEvidenceQuality,

    bestEvidenceIndex:
      bestEvidenceProfile?.index,

    sourceProfiles,
  };
}
