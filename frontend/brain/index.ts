import * as Planning from "./planning";
import * as Decision from "./decision";
import * as Execution from "./execution";

/**
 * Human OS Brain
 *
 * This is the ONLY public entry point that the rest of the
 * application should use to communicate with the Brain.
 */
export const Brain = {
  planning: {
    create: Planning.createPlanFromMessage,
    get: Planning.getPlan,
    getAll: Planning.getAllPlans,
    update: Planning.updatePlan,
    delete: Planning.deletePlan,
    clear: Planning.clearPlans,
    completeMilestone: Planning.completePlanMilestone,
  },

  decision: {
    create: Decision.createDecisionFromPlan,
    best: Decision.getBestDecision,
    get: Decision.getDecision,
    getAll: Decision.getAllDecisions,
    update: Decision.updateDecision,
    delete: Decision.deleteDecision,
    clear: Decision.clearDecisions,
  },

  execution: {
    create: Execution.createExecutionFromDecision,
    get: Execution.getExecution,
    getAll: Execution.getAllExecutions,
    update: Execution.updateExecution,
    delete: Execution.deleteExecution,
    clear: Execution.clearExecutions,
    start: Execution.startExecution,
    complete: Execution.completeExecution,
    block: Execution.blockExecution,
  },
};

export default Brain;

export type { Plan } from "./planning";
export type { Decision } from "./decision";
export type { Execution } from "./execution";