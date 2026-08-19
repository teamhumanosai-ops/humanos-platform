import {
  fetchWebContent,
} from "./content";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-002 web-content verification failed: ${message}`
    );
  }
}

const originalFetch =
  globalThis.fetch;

globalThis.fetch =
  async () =>
    new Response(
      "<html><head><title>Human OS Source</title><style>.hidden{display:none}</style></head><body><h1>Human OS</h1><p>Runtime evidence.</p><script>ignore()</script></body></html>",
      {
        status: 200,
        headers: {
          "Content-Type":
            "text/html; charset=utf-8",
        },
      }
    );

try {
  const result =
    await fetchWebContent(
      "https://example.com/source"
    );

  assert(
    result.status === 200,
    "successful content fetch must preserve HTTP status"
  );

  assert(
    result.title ===
      "Human OS Source",
    "HTML title must be extracted"
  );

  assert(
    result.text.includes(
      "Human OS"
    ),
    "readable page content must be preserved"
  );

  assert(
    !result.text.includes(
      "ignore()"
    ),
    "script content must not enter runtime evidence"
  );

  assert(
    result.contentType.includes(
      "text/html"
    ),
    "content type must be preserved"
  );

  let localHostRejected =
    false;

  try {
    await fetchWebContent(
      "http://localhost:3000/private"
    );
  } catch (error) {
    localHostRejected =
      error instanceof Error &&
      error.message.includes(
        "local hosts"
      );
  }

  assert(
    localHostRejected,
    "local hosts must be rejected before network access"
  );

  let privateAddressRejected =
    false;

  try {
    await fetchWebContent(
      "http://192.168.1.10/private"
    );
  } catch (error) {
    privateAddressRejected =
      error instanceof Error &&
      error.message.includes(
        "private IPv4"
      );
  }

  assert(
    privateAddressRejected,
    "private IPv4 addresses must be rejected before network access"
  );

  let credentialUrlRejected =
    false;

  try {
    await fetchWebContent(
      "https://user:password@example.com/source"
    );
  } catch (error) {
    credentialUrlRejected =
      error instanceof Error &&
      error.message.includes(
        "embedded credentials"
      );
  }

  assert(
    credentialUrlRejected,
    "credential-bearing URLs must be rejected"
  );

  console.log(
    "ATR-002 safe web-content verification passed."
  );
} finally {
  globalThis.fetch =
    originalFetch;
}
