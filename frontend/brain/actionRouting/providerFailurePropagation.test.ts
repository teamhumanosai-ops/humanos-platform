import {
  getActionCapability,
} from "./capabilities";

import type {
  RuntimeServices,
} from "../runtime/runtimeServices";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR provider failure propagation verification failed: ${message}`
    );
  }
}

const capability =
  getActionCapability(
    "web-search"
  );

assert(
  capability !== null,
  "web-search capability must remain registered"
);

const services = {
  searchWeb: async () => {
    throw new Error(
      "simulated Tavily provider failure"
    );
  },
  fetchWebContent: async () => ({
    url: "https://example.com",
    title: "source",
    text: "content",
    status: 200,
    contentType: "text/html",
    fetchedAt: new Date().toISOString(),
  }),
  fetchWebContentViaFirecrawl: async () => ({
    url: "https://example.com",
    title: "source",
    text: "content",
    status: 200,
    contentType: "text/markdown",
    fetchedAt: new Date().toISOString(),
  }),
  scrapeFirecrawl: async () => ({
    url: "https://example.com",
    title: "source",
    markdown: "content",
    status: 200,
    contentType: "text/markdown",
    fetchedAt: new Date().toISOString(),
  }),
  aiService: {} as RuntimeServices["aiService"],
} as RuntimeServices;

let propagated =
  false;

if (capability) {
  try {
    await capability.execute(
      "Search for the current status",
      services
    );
  } catch (error) {
    propagated =
      error instanceof Error &&
      error.message.includes(
        "simulated Tavily provider failure"
      );
  }
}

assert(
  propagated,
  "provider failures must propagate through the capability boundary"
);

console.log(
  "ATR provider failure propagation verification passed."
);
