import {
  routeDecisionAction,
} from "./router";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR route confidence verification failed: ${message}`
    );
  }
}

const high =
  routeDecisionAction({
    id: "decision-high-confidence",
    selectedAction: "Search the web",
    confidence: 2,
  } as never);

const low =
  routeDecisionAction({
    id: "decision-low-confidence",
    selectedAction: "Search the web",
    confidence: -1,
  } as never);

const invalid =
  routeDecisionAction({
    id: "decision-invalid-confidence",
    selectedAction: "Search the web",
    confidence: Number.NaN,
  } as never);

assert(
  high.confidence === 1,
  "confidence above one must be capped at one"
);

assert(
  low.confidence === 0,
  "negative confidence must be floored at zero"
);

assert(
  invalid.confidence === 0,
  "non-finite confidence must normalize to zero"
);

assert(
  high.executable === true &&
    low.executable === true &&
    invalid.executable === true,
  "confidence normalization must not alter route target validity"
);

console.log(
  "ATR route confidence verification passed."
);
