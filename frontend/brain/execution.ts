import {
  Decision,
} from "./decision";

import {
  generateExecution,
} from "./executionGenerator";

import {
  completePlanMilestone,
} from "./planning";

import type {
  ActionRoute,
} from "./actionRouting";

export type ExecutionStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "blocked";

export type ExecutionResult = {
  status:
    "completed" | "blocked";

  summary: string;

  metadata:
    Record<string, string>;

  error:
    string | null;
};

export type Execution = {
  id: string;

  planId: string;

  title: string;

  action: string;

  route:
    ActionRoute
    | null;

  status: ExecutionStatus;

  startedAt: Date | null;

  completedAt: Date | null;

  createdAt: Date;

  result:
    ExecutionResult | null;
};

const executionStore =
  new Map<
    string,
    Execution
  >();

/*
|--------------------------------------------------------------------------
| Query API
|--------------------------------------------------------------------------
*/

export function getAllExecutions():
  Execution[] {
  return Array.from(
    executionStore.values()
  );
}

export function getExecution(
  id: string
):
  Execution | undefined {
  return executionStore.get(
    id
  );
}

/*
|--------------------------------------------------------------------------
| Mutation API
|--------------------------------------------------------------------------
*/

export function saveExecution(
  execution: Execution
): void {
  executionStore.set(
    execution.id,
    execution
  );
}

export function updateExecution(
  execution: Execution
): void {
  saveExecution(
    execution
  );
}

export function deleteExecution(
  id: string
): void {
  executionStore.delete(
    id
  );
}

export function clearExecutions():
  void {
  executionStore.clear();
}

/*
|--------------------------------------------------------------------------
| Execution Creation
|--------------------------------------------------------------------------
*/

export function createExecutionFromDecision(
  decision: Decision,
  planId: string,
  route: ActionRoute | null = null
): Execution {
  const execution =
    generateExecution(
      decision,
      planId,
      route
    );

  const normalized:
    Execution = {
    ...execution,

    result:
      null,
  };

  saveExecution(
    normalized
  );

  return normalized;
}

/*
|--------------------------------------------------------------------------
| Execution Result
|--------------------------------------------------------------------------
*/

export function setExecutionResult(
  id: string,
  result: ExecutionResult
): Execution | null {
  const execution =
    getExecution(id);

  if (!execution) {
    return null;
  }

  const summary =
    result.summary.trim();

  if (!summary) {
    throw new Error(
      "Execution result summary cannot be empty."
    );
  }

  if (
    result.status ===
      "completed" &&
    result.error !== null
  ) {
    throw new Error(
      "Completed execution results cannot contain an error."
    );
  }

  if (
    result.status ===
      "blocked" &&
    !result.error?.trim()
  ) {
    throw new Error(
      "Blocked execution results must contain an error."
    );
  }

  if (
    execution.status !==
      "in_progress"
  ) {
    throw new Error(
      `Execution ${id} cannot accept a result while in ${execution.status} state.`
    );
  }

  const updated:
    Execution = {
    ...execution,

    result: {
      status:
        result.status,

      summary,

      metadata: {
        ...result.metadata,
      },

      error:
        result.error,
    },
  };

  saveExecution(
    updated
  );

  return updated;
}

/*
|--------------------------------------------------------------------------
| Execution Lifecycle
|--------------------------------------------------------------------------
*/

export function startExecution(
  id: string
):
  Execution | null {
  const execution =
    getExecution(id);

  if (!execution) {
    return null;
  }

  if (
    execution.status !==
    "pending"
  ) {
    return null;
  }

  const updated:
    Execution = {
    ...execution,

    status:
      "in_progress",

    startedAt:
      new Date(),
  };

  saveExecution(
    updated
  );

  return updated;
}

export function completeExecution(
  id: string
):
  Execution | null {
  const execution =
    getExecution(id);

  if (!execution) {
    return null;
  }

  if (
    execution.status !==
    "in_progress"
  ) {
    return null;
  }

  if (
    execution.result?.status !==
    "completed"
  ) {
    return null;
  }

  const updated:
    Execution = {
    ...execution,

    status:
      "completed",

    completedAt:
      new Date(),
  };

  saveExecution(
    updated
  );

  completePlanMilestone(
    updated.planId,
    updated.action
  );

  return updated;
}

export function blockExecution(
  id: string
):
  Execution | null {
  const execution =
    getExecution(id);

  if (!execution) {
    return null;
  }

  if (
    execution.status !==
      "pending" &&
    execution.status !==
      "in_progress"
  ) {
    return null;
  }

  const updated:
    Execution = {
    ...execution,

    status:
      "blocked",

    completedAt:
      execution.completedAt ??
      new Date(),
  };

  saveExecution(
    updated
  );

  return updated;
}
