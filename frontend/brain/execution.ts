import { Decision } from "./decision";
import { generateExecution } from "./executionGenerator";
import { completePlanMilestone } from "./planning";

export type ExecutionStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "blocked";

export type Execution = {
  id: string;

  planId: string;

  title: string;

  action: string;

  status: ExecutionStatus;

  startedAt: Date | null;

  completedAt: Date | null;

  createdAt: Date;
};

const executionStore = new Map<string, Execution>();

export function getExecutions(): Execution[] {
  return Array.from(executionStore.values());
}

export function getExecution(
  id: string
): Execution | undefined {
  return executionStore.get(id);
}

export function saveExecution(
  execution: Execution
): void {
  executionStore.set(execution.id, execution);
}

export function deleteExecution(
  id: string
): void {
  executionStore.delete(id);
}

export function clearExecutions(): void {
  executionStore.clear();
}

export function createExecutionFromDecision(
  decision: Decision,
  planId: string
): Execution {
  const execution = generateExecution(
    decision,
    planId
  );

  saveExecution(execution);

  return execution;
}

export function startExecution(
  id: string
): Execution | null {
  const execution = getExecution(id);

  if (!execution) {
    return null;
  }

  const updated: Execution = {
    ...execution,
    status: "in_progress",
    startedAt: new Date(),
  };

  saveExecution(updated);

  return updated;
}

export function completeExecution(
  id: string
): Execution | null {
  const execution = getExecution(id);

  if (!execution) {
    return null;
  }

  const updated: Execution = {
    ...execution,
    status: "completed",
    completedAt: new Date(),
  };

  saveExecution(updated);

  completePlanMilestone(
    updated.planId,
    updated.action
  );

  return updated;
}

export function blockExecution(
  id: string
): Execution | null {
  const execution = getExecution(id);

  if (!execution) {
    return null;
  }

  const updated: Execution = {
    ...execution,
    status: "blocked",
  };

  saveExecution(updated);

  return updated;
}