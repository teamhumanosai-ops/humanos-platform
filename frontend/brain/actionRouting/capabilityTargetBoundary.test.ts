import {
  getActionCapability,
  hasActionCapability,
} from "./capabilities";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR capability target verification failed: ${message}`
    );
  }
}

const targets = [
  "web-search",
  "web-content",
  "cognitive",
  "tool",
] as const;

for (const target of targets) {
  assert(
    hasActionCapability(target),
    `registered capability target ${target} must remain discoverable`
  );

  assert(
    getActionCapability(target)?.target === target,
    `capability lookup must preserve target identity for ${target}`
  );
}

assert(
  getActionCapability("unregistered") === null,
  "unknown capability targets must not resolve to a registered capability"
);

assert(
  hasActionCapability("unregistered") === false,
  "unknown capability targets must report unavailable"
);

console.log(
  "ATR capability target verification passed."
);
