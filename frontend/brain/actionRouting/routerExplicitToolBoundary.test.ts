import {
  routeDecisionAction,
} from "./router";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR explicit tool routing verification failed: ${message}`
    );
  }
}

const route =
  routeDecisionAction({
    id: "decision-tool-boundary",
    selectedAction:
      "tool:message:Send the message",
    confidence: 0.98,
  } as never);

assert(
  route.kind === "tool",
  "explicit tool syntax must route to the tool boundary"
);

assert(
  route.target === "tool",
  "explicit tool syntax must resolve to the tool capability target"
);

assert(
  route.executable === true,
  "a valid explicit tool route must be executable before authorization"
);

assert(
  route.id === "route-decision-tool-boundary",
  "routing must preserve deterministic decision-derived route identity"
);

console.log(
  "ATR explicit tool routing verification passed."
);
