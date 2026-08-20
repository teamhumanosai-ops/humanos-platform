import {
  getActionCapability,
} from "./capabilities";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR capability failure verification failed: ${message}`
    );
  }
}

const capability =
  getActionCapability(
    "web-content"
  );

assert(
  capability !== null,
  "web-content capability must remain registered"
);

if (capability) {
  let rejected =
    false;

  try {
    await capability.execute(
      "Fetch the source",
      {} as never
    );
  } catch (error) {
    rejected =
      error instanceof Error &&
      error.message.includes(
        "explicit HTTP or HTTPS URL"
      );
  }

  assert(
    rejected,
    "web-content must reject execution without a concrete URL before provider invocation"
  );
}

const cognitive =
  getActionCapability(
    "cognitive"
  );

assert(
  cognitive !== null,
  "cognitive capability must remain registered"
);

if (cognitive) {
  let rejected =
    false;

  try {
    await cognitive.execute(
      "   ",
      {} as never
    );
  } catch (error) {
    rejected =
      error instanceof Error &&
      error.message.includes(
        "non-empty action"
      );
  }

  assert(
    rejected,
    "cognitive capability must reject empty actions before provider invocation"
  );
}

console.log(
  "ATR capability failure verification passed."
);
