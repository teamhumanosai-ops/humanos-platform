import * as Planning from "./planning";
import * as Decision from "./decision";
import * as Execution from "./execution";
import * as ActionRouting from "./actionRouting";
import * as Autonomy from "./autonomy";

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

  actionRouting: {
    route: ActionRouting.routeDecisionAction,
  },

  autonomy: {
    evaluate: Autonomy.evaluateAutonomousLoop,
    Controller: Autonomy.AutonomousLoopController,
  },
};

export default Brain;

export type { Plan } from "./planning";
export type { Decision } from "./decision";
export type { Execution } from "./execution";
export type {
  ActionRoute,
  ActionRouteKind,
} from "./actionRouting";
export type {
  AutonomousLoopDecision,
  AutonomousLoopOptions,
  AutonomousLoopStatus,
} from "./autonomy";
