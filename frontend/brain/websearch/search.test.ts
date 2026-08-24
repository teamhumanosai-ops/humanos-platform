import {
  searchWeb,
} from "./search";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `PROV-003 search verification failed: ${message}`
    );
  }
}

const originalTavilyKey =
  process.env.TAVILY_API_KEY;

const originalFirecrawlKey =
  process.env.FIRECRAWL_API_KEY;

const originalFetch =
  globalThis.fetch;

process.env.TAVILY_API_KEY =
  "test-tavily";

process.env.FIRECRAWL_API_KEY =
  "test-firecrawl";

globalThis.fetch =
  async (
    input: RequestInfo | URL
  ) => {
    const url = String(input);

    if (
      url.includes("api.tavily.com")
    ) {
      return new Response(
        JSON.stringify({
          query: "Human OS 2026",
          answer: "Tavily answer",
          results: [
            {
              title: "Shared source",
              url: "https://example.com/shared",
              content: "Shared evidence",
            },
            {
              title: "Tavily-only source",
              url: "https://example.com/tavily",
              content: "Tavily evidence",
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (
      url.includes("api.firecrawl.dev")
    ) {
      return new Response(
        JSON.stringify({
          success: true,
          data: {
            web: [
              {
                title: "Shared source",
                url: "https://example.com/shared",
                description: "Firecrawl evidence",
              },
              {
                title: "Firecrawl-only source",
                url: "https://example.com/firecrawl",
                description: "Firecrawl evidence",
              },
            ],
            news: [],
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    throw new Error(
      `Unexpected search URL: ${url}`
    );
  };

try {
  const response =
    await searchWeb(
      "Human OS"
    );

  assert(
    response.results.length === 3,
    "duplicate URLs must be merged"
  );

  const shared =
    response.results.find(
      (result) =>
        result.url ===
        "https://example.com/shared"
    );

  assert(
    shared?.providers?.length === 2,
    "shared result must retain both providers"
  );

  assert(
    shared?.providers?.includes("tavily") === true &&
      shared?.providers?.includes("firecrawl") === true,
    "shared result must identify both actual providers"
  );

  assert(
    response.provenance?.requiredProviders.length === 2,
    "provenance must declare both required providers"
  );

  assert(
    response.provenance?.observedProviders.includes("tavily") === true &&
      response.provenance?.observedProviders.includes("firecrawl") === true,
    "provenance must identify all observed providers"
  );

  assert(
    response.provenance?.dualProviderResultCount === 1,
    "provenance must identify the shared result"
  );

  assert(
    response.provenance?.resultCount === 3,
    "provenance result count must match normalized results"
  );

  assert(
    response.provenance?.dualProviderCoverage === 1 / 3,
    "provenance coverage must be deterministic"
  );

  process.env.FIRECRAWL_API_KEY = "";

  let missingProviderFailed = false;

  try {
    await searchWeb(
      "Human OS"
    );
  } catch (error) {
    missingProviderFailed =
      error instanceof Error &&
      error.message.includes(
        "firecrawl"
      );
  }

  assert(
    missingProviderFailed,
    "missing required provider must fail closed"
  );

  process.env.FIRECRAWL_API_KEY =
    "test-firecrawl";

  let tavilyFailureFailed = false;
  const baselineFetch =
    globalThis.fetch;

  globalThis.fetch =
    async (
      input: RequestInfo | URL
    ) => {
      const url = String(input);

      if (
        url.includes("api.tavily.com")
      ) {
        return new Response(
          JSON.stringify({
            error: {
              message: "Tavily unavailable",
            },
          }),
          {
            status: 503,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      return baselineFetch(input);
    };

  try {
    await searchWeb(
      "Human OS"
    );
  } catch (error) {
    tavilyFailureFailed =
      error instanceof Error &&
      error.message.includes(
        "tavily web search failed"
      );
  }

  assert(
    tavilyFailureFailed,
    "Tavily provider failure must fail closed rather than silently returning partial evidence"
  );

  process.env.TAVILY_API_KEY = "";

  let missingTavilyFailed = false;

  try {
    await searchWeb(
      "Human OS"
    );
  } catch (error) {
    missingTavilyFailed =
      error instanceof Error &&
      error.message.includes(
        "tavily"
      );
  }

  assert(
    missingTavilyFailed,
    "missing Tavily provider must fail closed"
  );

  process.env.TAVILY_API_KEY =
    "test-tavily";

  let firecrawlFailureFailed = false;

  globalThis.fetch =
    async (
      input: RequestInfo | URL
    ) => {
      const url = String(input);

      if (
        url.includes("api.firecrawl.dev")
      ) {
        return new Response(
          JSON.stringify({
            success: false,
            error: "Firecrawl unavailable",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      return baselineFetch(input);
    };

  try {
    await searchWeb(
      "Human OS"
    );
  } catch (error) {
    firecrawlFailureFailed =
      error instanceof Error &&
      error.message.includes(
        "firecrawl web search failed"
      );
  }

  assert(
    firecrawlFailureFailed,
    "Firecrawl provider failure must fail closed rather than silently returning partial evidence"
  );

  console.log(
    "PROV-003 dual-provider web search verification passed."
  );
} finally {
  if (
    originalTavilyKey ===
    undefined
  ) {
    delete process.env.TAVILY_API_KEY;
  } else {
    process.env.TAVILY_API_KEY =
      originalTavilyKey;
  }

  if (
    originalFirecrawlKey ===
    undefined
  ) {
    delete process.env.FIRECRAWL_API_KEY;
  } else {
    process.env.FIRECRAWL_API_KEY =
      originalFirecrawlKey;
  }

  globalThis.fetch =
    originalFetch;
}
