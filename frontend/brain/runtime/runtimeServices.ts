import { aiService } from "../core/aiService";
import { searchWeb } from "../websearch";

export type RuntimeServices = {
  aiService: typeof aiService;

  searchWeb: typeof searchWeb;
};

export const runtimeServices: RuntimeServices = {
  aiService,

  searchWeb,
};