import {
  getActionCapability,
} from "./capabilities";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`ATR capability result verification failed: ${message}`);
  }
}

const cognitive = getActionCapability("cognitive");
assert(cognitive !== null, "cognitive capability must remain registered");

if (cognitive) {
  let rejected = false;

  try {
    await cognitive.execute("   ", {} as never);
  } catch (error) {
    rejected =
      error instanceof Error &&
      error.message.includes("non-empty action");
  }

  assert(
    rejected,
    "cognitive capability must reject empty execution before provider invocation"
  );
}

const webContent = getActionCapability("web-content");
assert(webContent !== null, "web-content capability must remain registered");

if (webContent) {
  let rejected = false;

  try {
    await webContent.execute("Fetch example.com", {} as never);
  } catch (error) {
    rejected =
      error instanceof Error &&
      error.message.includes("explicit HTTP or HTTPS URL");
  }

  assert(
    rejected,
    "web-content capability must require a concrete URL before provider invocation"
  );
}

console.log("ATR capability result integrity verification passed.");
