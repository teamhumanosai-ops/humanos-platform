import {
  aiService,
} from "../core/aiService";

import {
  fetchWebContent,
  searchWeb,
} from "../websearch";

export type RuntimeServices = {
  aiService:
    typeof aiService;

  searchWeb:
    typeof searchWeb;

  fetchWebContent:
    typeof fetchWebContent;
};

export const runtimeServices:
  RuntimeServices = {
    aiService,

    searchWeb,

    fetchWebContent,
  };