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
  aiService:
    typeof aiService;

  searchWeb:
    typeof searchWeb;

  fetchWebContent:
    typeof fetchWebContent;

  fetchWebContentViaFirecrawl:
    typeof fetchWebContentViaFirecrawl;

  scrapeFirecrawl:
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
