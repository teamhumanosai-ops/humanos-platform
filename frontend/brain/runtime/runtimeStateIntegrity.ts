import {
  BrainState,
} from "../brainState";

/**
 * Validate the terminal BrainState contract after the canonical runtime
 * lifecycle has completed. The runtime remains responsible for creating
 * the artifacts; this helper only verifies that the final state preserves
 * their relationships.
 */
export function assertRuntimeStateIntegrity(
  state: BrainState
): BrainState {
  if (!state.outcome) {
    throw new Error(
      "Runtime state integrity failed: terminal outcome is missing."
    );
  }

  const recordedStages =
    state.outcome.metadata.stagesExecuted;

  if (
    recordedStages.length !==
    state.executedStages.length
  ) {
    throw new Error(
      "Runtime state integrity failed: outcome stage history length does not match BrainState executedStages."
    );
  }

  for (
    let index = 0;
    index < state.executedStages.length;
    index += 1
  ) {
    if (
      recordedStages[index] !==
      state.executedStages[index]
    ) {
      throw new Error(
        "Runtime state integrity failed: outcome stage history does not match BrainState executedStages."
      );
    }
  }

  if (
    state.diagnostics.length !==
    state.executedStages.length
  ) {
    throw new Error(
      "Runtime state integrity failed: diagnostic count does not match BrainState executedStages."
    );
  }

  for (
    let index = 0;
    index < state.diagnostics.length;
    index += 1
  ) {
    const diagnostic =
      state.diagnostics[index];

    if (
      diagnostic.stage !==
      state.executedStages[index]
    ) {
      throw new Error(
        "Runtime state integrity failed: diagnostic stage order does not match BrainState executedStages."
      );
    }

    const expectedDuration =
      diagnostic.completedAt.getTime() -
      diagnostic.startedAt.getTime();

    if (
      expectedDuration < 0 ||
      diagnostic.durationMs !==
      expectedDuration
    ) {
      throw new Error(
        "Runtime state integrity failed: diagnostic duration is inconsistent with its timestamps."
      );
    }

    if (
      diagnostic.success &&
      diagnostic.error !== null
    ) {
      throw new Error(
        "Runtime state integrity failed: successful diagnostic contains an error."
      );
    }

    if (
      !diagnostic.success &&
      !diagnostic.error?.trim()
    ) {
      throw new Error(
        "Runtime state integrity failed: failed diagnostic is missing an error."
      );
    }
  }

  if (
    state.outcome.errors.length !==
    state.errors.length
  ) {
    throw new Error(
      "Runtime state integrity failed: outcome errors do not match BrainState errors."
    );
  }

  for (
    let index = 0;
    index < state.errors.length;
    index += 1
  ) {
    if (
      state.outcome.errors[index] !==
      state.errors[index]
    ) {
      throw new Error(
        "Runtime state integrity failed: outcome errors do not preserve BrainState error order."
      );
    }
  }

  const metadata =
    state.outcome.metadata;

  if (
    metadata.executionId !==
    state.currentExecutionId
  ) {
    throw new Error(
      "Runtime state integrity failed: outcome executionId does not match BrainState currentExecutionId."
    );
  }

  if (
    metadata.planId !==
    state.currentPlanId
  ) {
    throw new Error(
      "Runtime state integrity failed: outcome planId does not match BrainState currentPlanId."
    );
  }

  if (
    metadata.decisionId !==
    state.currentDecisionId
  ) {
    throw new Error(
      "Runtime state integrity failed: outcome decisionId does not match BrainState currentDecisionId."
    );
  }

  if (
    state.outcome.status ===
      "failed" &&
    state.errors.length === 0
  ) {
    throw new Error(
      "Runtime state integrity failed: failed outcome has no runtime errors."
    );
  }

  if (
    state.outcome.status ===
      "blocked" &&
    state.runtimeStatus !==
      "blocked"
  ) {
    throw new Error(
      "Runtime state integrity failed: blocked outcome does not match runtime status."
    );
  }

  if (
    state.outcome.status ===
      "completed" &&
    state.runtimeStatus !==
      "completed"
  ) {
    throw new Error(
      "Runtime state integrity failed: completed outcome does not match runtime status."
    );
  }

  if (
    state.outcome.status ===
      "in_progress" &&
    state.runtimeStatus !==
      "in_progress"
  ) {
    throw new Error(
      "Runtime state integrity failed: in-progress outcome does not match runtime status."
    );
  }

  return state;
}
