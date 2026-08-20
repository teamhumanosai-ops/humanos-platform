import { createBrainState } from "../../brainState";
import { ValidationStage } from "./validationStage";

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Life Domain validation failed: ${message}`);
  }
}

const state = createBrainState(
  "conversation",
  [],
  "Help me plan my study schedule"
);

state.primaryLifeDomain = "learning";
state.currentPlanId = "plan-learning";
state.currentDecisionId = "decision-learning";
state.decision =
  "Decision: Study plan\nLife Domain: Learning";

const errorsBefore = state.errors.length;
const result = await new ValidationStage().execute(state);

assert(
  result === state,
  "validation must preserve the existing BrainState object"
);
assert(
  state.errors.length === errorsBefore,
  "a valid request-scoped life-domain decision must not create validation errors"
);
assert(
  state.primaryLifeDomain === "learning",
  "validation must not erase the request-scoped Life Domain"
);

console.log("Life Domain validation verification passed.");
