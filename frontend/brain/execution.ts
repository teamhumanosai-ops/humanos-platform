import { Decision } from "./decision";
import { generateExecution } from "./executionGenerator";

export type Execution = {
  id: string;

  title: string;

  action: string;

  status:
    | "pending"
    | "in_progress"
    | "completed"
    | "blocked";

  startedAt: Date | null;

  completedAt: Date | null;

  createdAt: Date;
};

const executionStore = new Map<
  string,
  Execution
>();

export function getExecutions(): Execution[] {
  return Array.from(
    executionStore.values()
  );
}

export function getExecution(
  id: string
): Execution | undefined {
  return executionStore.get(id);
}

export function saveExecution(
  execution: Execution
): void {
  executionStore.set(
    execution.id,
    execution
  );
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
  decision: Decision
): Execution {
  const execution =
    generateExecution(decision);

  saveExecution(execution);

  return execution;
}