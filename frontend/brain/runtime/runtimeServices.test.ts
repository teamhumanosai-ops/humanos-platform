import {
  runtimeServices,
} from "./runtimeServices";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Runtime service boundary regression failed: ${message}`
    );
  }
}

assert(
  Object.isFrozen(runtimeServices),
  "canonical provider service registry must remain frozen"
);

assert(
  typeof runtimeServices.aiService === "function",
  "AI provider boundary must remain available"
);

assert(
  typeof runtimeServices.searchWeb === "function",
  "web search provider boundary must remain available"
);

assert(
  typeof runtimeServices.fetchWebContent === "function",
  "web content provider boundary must remain available"
);

assert(
  typeof runtimeServices.fetchWebContentViaFirecrawl === "function",
  "Firecrawl content provider boundary must remain available"
);

assert(
  typeof runtimeServices.scrapeFirecrawl === "function",
  "Firecrawl scrape provider boundary must remain available"
);

console.log(
  "Runtime service boundary regression verification passed."
);
