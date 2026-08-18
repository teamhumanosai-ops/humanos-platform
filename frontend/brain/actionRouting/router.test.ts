import {
  routeDecisionAction,
} from "./router";

import type {
  Decision,
} from "../decision";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ATR-001 routing verification failed: ${message}`
    );
  }
}

const baseDecision: Decision = {
  id: "decision-1",
  title: "Choose next action",
  description: "Select the next cognitive action.",
  selectedAction: "Search for the latest project status",
  alternatives: [],
  reason: "Current evidence requires fresh information.",
  confidence: 1.4,
  createdAt: new Date(),
};

const providerRoute =
  routeDecisionAction(
    baseDecision
  );

assert(
  providerRoute.kind ===
    "provider",
  "search actions must route to a provider"
);

assert(
  providerRoute.executable ===
    true,
  "recognized routes must be executable candidates"
);

assert(
  providerRoute.confidence ===
    1,
  "route confidence must be normalized to one"
);

const unknownRoute =
  routeDecisionAction({
    ...baseDecision,
    id: "decision-2",
    selectedAction: "Do something ambiguous",
    confidence: -1,
  });

assert(
  unknownRoute.kind ===
    "unknown",
  "unrecognized actions must remain unresolved"
);

assert(
  unknownRoute.executable ===
    false,
  "unresolved actions must never be executable candidates"
);

assert(
  unknownRoute.confidence ===
    0,
  "route confidence must not fall below zero"
);
