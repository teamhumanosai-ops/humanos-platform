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
};

export type ContentIntelligence = {
  sourceCount: number;

  uniqueDomainCount: number;

  providerCount: number;

  crossProviderAgreementCount: number;

  averageFreshness: number;

  averageCompleteness: number;

  sourceProfiles: ContentSourceProfile[];
};
