import {
  getActionCapability,
} from "./capabilities";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ATR web-content verification failed: ${message}`);
  }
}

const capability = getActionCapability("web-content");
assert(capability !== null, "web-content capability must remain registered");

if (capability) {
  const result = await capability.execute(
    "Fetch https://example.com",
    {
      fetchWebContentViaFirecrawl: async () => ({
        url: "https://example.com",
        title: "Example",
        text: "Readable content",
        status: 200,
        contentType: "text/html",
        fetchedAt: "2026-08-19T00:00:00.000Z",
      }),
    } as never
  );

  assert(
    result.metadata?.provider === "firecrawl",
    "web-content execution must preserve Firecrawl provenance"
  );

  assert(
    result.metadata?.url === "https://example.com",
    "web-content execution must preserve the fetched URL"
  );

  assert(
    result.metadata?.status === "200",
    "web-content execution must preserve the provider response status"
  );

  assert(
    result.metadata?.capabilityTarget === "web-content",
    "web-content execution must preserve capability provenance"
  );
}

console.log("ATR web-content provenance verification passed.");
