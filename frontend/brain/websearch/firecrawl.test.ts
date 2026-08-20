import {
  isFirecrawlConfigured,
  searchFirecrawl,
} from "./firecrawl";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `PROV-003 Firecrawl verification failed: ${message}`
    );
  }
}

const originalKey =
  process.env.FIRECRAWL_API_KEY;

const originalFetch =
  globalThis.fetch;

try {
  delete process.env.FIRECRAWL_API_KEY;

  assert(
    isFirecrawlConfigured() === false,
    "Firecrawl must report unconfigured without an API key"
  );

  process.env.FIRECRAWL_API_KEY =
    "test-firecrawl";

  assert(
    isFirecrawlConfigured() === true,
    "Firecrawl must report configured with an API key"
  );

  globalThis.fetch =
    async () =>
      new Response(
        JSON.stringify({
          success: true,
          data: {
            web: [
              {
                title: "Primary",
                metadata: {
                  sourceURL:
                    "https://example.com/primary",
                  description:
                    "Primary evidence",
                },
              },
            ],
            news: [
              {
                title: "News",
                url: "https://example.com/news",
                snippet: "News evidence",
                date: "2026-08-18",
              },
            ],
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

  const response =
    await searchFirecrawl(
      "Human OS"
    );

  assert(
    response.results.length === 2,
    "web and news results must be normalized"
  );

  assert(
    response.results[0].providers?.[0] ===
      "firecrawl",
    "normalized results must preserve Firecrawl provenance"
  );

  assert(
    response.results[0].url ===
      "https://example.com/primary",
    "metadata sourceURL must normalize to the result URL"
  );

  assert(
    response.results[1].publishedDate ===
      "2026-08-18",
    "news publication date must be preserved"
  );

  console.log(
    "PROV-003 Firecrawl normalization verification passed."
  );
} finally {
  if (
    originalKey ===
    undefined
  ) {
    delete process.env.FIRECRAWL_API_KEY;
  } else {
    process.env.FIRECRAWL_API_KEY =
      originalKey;
  }

  globalThis.fetch =
    originalFetch;
}
