import {
  aiService,
} from "../core/aiService";

import {
  fetchWebContent,
  fetchWebContentViaFirecrawl,
  searchWeb,
  scrapeFirecrawl,
} from "../websearch";

export type RuntimeServices = {
  readonly aiService:
    typeof aiService;

  readonly searchWeb:
    typeof searchWeb;

  readonly fetchWebContent:
    typeof fetchWebContent;

  readonly fetchWebContentViaFirecrawl:
    typeof fetchWebContentViaFirecrawl;

  readonly scrapeFirecrawl:
    typeof scrapeFirecrawl;
};

export const runtimeServices:
  RuntimeServices = Object.freeze({
    aiService,

    searchWeb,

    fetchWebContent,

    fetchWebContentViaFirecrawl,

    scrapeFirecrawl,
  });
