import {
  scrapeFirecrawl,
} from "./firecrawl";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-002 Firecrawl content verification failed: ${message}`
    );
  }
}

const originalFetch =
  globalThis.fetch;

const originalApiKey =
  process.env.FIRECRAWL_API_KEY;

process.env.FIRECRAWL_API_KEY =
  "test-firecrawl-key";

globalThis.fetch =
  async () =>
    new Response(
      JSON.stringify({
        success: true,
        data: {
          markdown:
            "# Human OS\n\nFirecrawl execution evidence.",
          metadata: {
            title:
              "Human OS Firecrawl Source",
            sourceURL:
              "https://example.com/source",
            statusCode:
              200,
            contentType:
              "text/markdown",
          },
        },
      }),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/json",
        },
      }
    );

try {
  const result =
    await scrapeFirecrawl(
      "https://example.com/source"
    );

  assert(
    result.status === 200,
    "Firecrawl status must be preserved"
  );

  assert(
    result.title ===
      "Human OS Firecrawl Source",
    "Firecrawl title metadata must be preserved"
  );

  assert(
    result.markdown.includes(
      "Firecrawl execution evidence"
    ),
    "Firecrawl markdown must be preserved"
  );

  assert(
    result.url ===
      "https://example.com/source",
    "Firecrawl source URL must be preserved"
  );

  console.log(
    "ATR-002 Firecrawl content verification passed."
  );
} finally {
  globalThis.fetch =
    originalFetch;

  if (
    originalApiKey ===
    undefined
  ) {
    delete process.env.FIRECRAWL_API_KEY;
  } else {
    process.env.FIRECRAWL_API_KEY =
      originalApiKey;
  }
}
