import {
  createBrainState,
} from "../../brainState";

import {
  Intent,
} from "../../intent";

import {
  ReasoningStage,
} from "./reasoningStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `CI-006 life-domain reasoning verification failed: ${message}`
    );
  }
}

async function runVerification(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Help me prepare the quarterly work review."
    );

  state.intent =
    Intent.PLANNING;

  state.primaryLifeDomain =
    "work";

  const result =
    await new ReasoningStage().execute(
      state
    );

  const domainObservation =
    result.reasoningObservations.find(
      (observation) =>
        observation.source ===
        "life_domain"
    );

  assert(
    Boolean(
      domainObservation
    ),
    "request-scoped life domain must become reasoning evidence"
  );

  assert(
    domainObservation?.statement.includes(
      "Work (work)"
    ) === true,
    "reasoning evidence must preserve the canonical domain identity"
  );

  assert(
    domainObservation?.relevance ===
      1,
    "life-domain routing evidence must remain directly relevant"
  );

  assert(
    result.reasoning?.includes(
      "Source: life_domain"
    ) === true,
    "human-readable reasoning must expose the life-domain evidence source"
  );

  assert(
    result.primaryLifeDomain ===
      "work",
    "reasoning must not mutate the request-scoped domain"
  );

  const generalState =
    createBrainState(
      "conversation",
      [],
      "Help me with this."
    );

  const generalResult =
    await new ReasoningStage().execute(
      generalState
    );

  assert(
    !generalResult.reasoningObservations.some(
      (observation) =>
        observation.source ===
        "life_domain"
    ),
    "general requests must not invent life-domain reasoning evidence"
  );

  console.log(
    "CI-006 life-domain reasoning verification passed."
  );
}

void runVerification();
