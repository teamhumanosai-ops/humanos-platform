import { aiService } from "../core/aiService";

export type RuntimeServices = {
  aiService: typeof aiService;
};

export const runtimeServices: RuntimeServices = {
  aiService,
};