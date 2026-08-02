export type BrainState = {
  /*
  |--------------------------------------------------------------------------
  | Input
  |--------------------------------------------------------------------------
  */

  conversation: string;

  /*
  |--------------------------------------------------------------------------
  | Runtime Context
  |--------------------------------------------------------------------------
  */

  currentGoal: string | null;

  currentPlanId: string | null;

  currentDecisionId: string | null;

  currentExecutionId: string | null;

  /*
  |--------------------------------------------------------------------------
  | Processing Flags
  |--------------------------------------------------------------------------
  */

  hasMemory: boolean;

  hasReflection: boolean;

  hasLearning: boolean;

  hasPlanning: boolean;

  hasDecision: boolean;

  hasExecution: boolean;

  /*
  |--------------------------------------------------------------------------
  | Metadata
  |--------------------------------------------------------------------------
  */

  createdAt: Date;

  updatedAt: Date;
};

export function createBrainState(
  conversation: string
): BrainState {
  const now = new Date();

  return {
    conversation,

    currentGoal: null,

    currentPlanId: null,

    currentDecisionId: null,

    currentExecutionId: null,

    hasMemory: false,

    hasReflection: false,

    hasLearning: false,

    hasPlanning: false,

    hasDecision: false,

    hasExecution: false,

    createdAt: now,

    updatedAt: now,
  };
}