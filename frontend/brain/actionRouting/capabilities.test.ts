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
      `ATR-001 capability verification failed: ${message}`
    );
  }
}

assert(
  hasActionCapability("web-search"),
  "web-search must be explicitly registered"
);

assert(
  hasActionCapability("cognitive"),
  "cognitive execution must be explicitly registered"
);

assert(
  !hasActionCapability("tool"),
  "unregistered tools must not become executable"
);

assert(
  !hasActionCapability("web-content"),
  "unregistered web-content must not become executable"
);

assert(
  getActionCapability("web-search") !== null,
  "registered web-search capability must resolve"
);

assert(
  getActionCapability("unknown") === null,
  "unknown capabilities must resolve to null"
);
