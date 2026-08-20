import { createBrainState } from "../../brainState";
import {
  createDecisionFromPlan,
  deleteDecision,
} from "../../decision";
import {
  createPlanFromMessage,
  deletePlan,
} from "../../planning";
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

const plan = createPlanFromMessage(
  "Help me plan my study schedule"
);

if (!plan) {
  throw new Error("Expected a plan for the validation boundary test.");
}

const decision = createDecisionFromPlan(plan);
state.currentPlanId = plan.id;
state.currentDecisionId = decision.id;

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

if (plan) {
  deletePlan(plan.id);
}
deleteDecision(decision.id);

console.log("Life Domain validation verification passed.");
