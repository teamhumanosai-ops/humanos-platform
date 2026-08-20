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

  return state;
}
