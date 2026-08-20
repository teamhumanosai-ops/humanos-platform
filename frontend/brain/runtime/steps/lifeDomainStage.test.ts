import { createBrainState } from "../../brainState";
import { LifeDomainStage } from "./lifeDomainStage";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Life Domain stage verification failed: ${message}`);
  }
}

const state = createBrainState(
  "conversation",
  [],
  "Help me plan my study schedule"
);

await new LifeDomainStage().execute(state);

assert(
  state.lifeDomains.length > 0,
  "study request must resolve at least one life domain"
);
assert(
  state.primaryLifeDomain === state.lifeDomains[0]?.domain,
  "primary domain must remain the highest-ranked request-scoped domain"
);
assert(
  state.primaryLifeDomain !== "",
  "primary domain must always have a canonical identity"
);

const unrelated = createBrainState(
  "conversation",
  [],
  "What is the capital of France?"
);

await new LifeDomainStage().execute(unrelated);

assert(
  unrelated.primaryLifeDomain === "general",
  "unrelated requests must safely fall back to the general domain"
);

console.log("Life Domain stage verification passed.");
