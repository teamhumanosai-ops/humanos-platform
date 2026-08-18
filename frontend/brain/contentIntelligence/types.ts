import type {
  WebSearchProvider,
} from "../websearch/providers";

export type ContentSourceType =
  | "web"
  | "news";

export type ContentSourceProfile = {
  index: number;

  title: string;

  url: string;

  domain: string;

  sourceType: ContentSourceType;

  providers: WebSearchProvider[];

  providerAgreement: boolean;

  freshness: number;

  completeness: number;

  evidenceReady: boolean;

  evidenceQuality: number;
};

export type ContentIntelligence = {
  sourceCount: number;

  uniqueDomainCount: number;

  providerCount: number;

  crossProviderAgreementCount: number;

  evidenceReadyCount: number;

  evidenceReadyRatio: number;

  agreementCoverage: number;

  averageFreshness: number;

  averageCompleteness: number;

  averageEvidenceQuality: number;

  bestEvidenceIndex?: number;

  sourceProfiles: ContentSourceProfile[];
};
