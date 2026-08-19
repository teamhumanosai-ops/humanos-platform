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
  providerRoute.target ===
    "web-search",
  "search actions must resolve to web-search"
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

assert(
  providerRoute.id ===
    "route-decision-1",
  "route identifiers must remain deterministic"
);

const contentRoute =
  routeDecisionAction({
    ...baseDecision,
    id: "decision-content",
    selectedAction:
      "Fetch the source page for verification",
  });

assert(
  contentRoute.kind ===
    "provider",
  "fetch actions must route to a provider"
);

assert(
  contentRoute.target ===
    "web-content",
  "fetch actions must resolve to the web-content target"
);

const toolRoute =
  routeDecisionAction({
    ...baseDecision,
    id: "decision-tool",
    selectedAction:
      "Create the requested project task",
  });

assert(
  toolRoute.kind ===
    "tool",
  "tool actions must route to the tool boundary"
);

assert(
  toolRoute.target ===
    "tool",
  "tool actions must resolve to the tool target"
);

const internalRoute =
  routeDecisionAction({
    ...baseDecision,
    id: "decision-internal",
    selectedAction:
      "Review the next project milestone",
  });

assert(
  internalRoute.kind ===
    "internal",
  "internal cognitive actions must remain internal"
);

assert(
  internalRoute.target ===
    "cognitive",
  "internal actions must resolve to the cognitive target"
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
  unknownRoute.target ===
    "unresolved",
  "unrecognized actions must remain unresolved targets"
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

const falsePositiveRoute =
  routeDecisionAction({
    ...baseDecision,
    id: "decision-false-positive",
    selectedAction:
      "Please resend the message",
  });

assert(
  falsePositiveRoute.kind ===
    "unknown",
  "route keywords must not match inside larger words"
);

assert(
  falsePositiveRoute.executable ===
    false,
  "false-positive routes must never become executable"
);
