import {
  getActionCapability,
} from "./capabilities";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-002 web-content capability verification failed: ${message}`
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
            "# Human OS\n\nAction capability content.",
          metadata: {
            title:
              "Human OS Capability Source",
            sourceURL:
              "https://example.com/capability",
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
  const capability =
    getActionCapability(
      "web-content"
    );

  assert(
    capability !== null,
    "web-content capability must be registered"
  );

  if (capability) {
    const result =
      await capability.execute(
        "Read https://example.com/capability",
        {} as never
      );

    assert(
      result.summary.includes(
        "Human OS Capability Source"
      ),
      "web-content capability must execute through Firecrawl"
    );

    assert(
      result.summary.includes(
        "Action capability content"
      ),
      "web-content execution result must preserve readable content"
    );
  }

  console.log(
    "ATR-002 web-content capability verification passed."
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
