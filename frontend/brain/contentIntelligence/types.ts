export type ContentSourceType =
  | "web"
  | "news";

export type ContentSourceProfile = {
  index: number;

  title: string;

  url: string;

  domain: string;

  sourceType: ContentSourceType;

  freshness: number;

  completeness: number;

  evidenceReady: boolean;
};

export type ContentIntelligence = {
  sourceCount: number;

  uniqueDomainCount: number;

  averageFreshness: number;

  averageCompleteness: number;

  sourceProfiles: ContentSourceProfile[];
};
