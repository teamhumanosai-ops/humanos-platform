import {
  aiService,
} from "../core/aiService";

import {
  fetchWebContent,
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

  scrapeFirecrawl:
    typeof scrapeFirecrawl;
};

export const runtimeServices:
  RuntimeServices = {
    aiService,

    searchWeb,

    fetchWebContent,

    scrapeFirecrawl,
  };
