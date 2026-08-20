import {
  AutonomousLoopController,
  formatAutonomousLoopDecision,
} from "../../autonomy";

import {
  BrainState,
} from "../../brainState";

import {
  BaseStage,
} from "./baseStage";

/**
 * Evaluates whether the completed cognitive cycle has a
 * bounded candidate continuation.
 *
 * This stage is deliberately advisory:
 * it records the autonomy decision but never executes
 * the candidate action.
 */
export class AutonomyStage
  extends BaseStage {
  readonly name =
    "Autonomy";

  private readonly controller =
    new AutonomousLoopController();

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    const decision =
      this.controller.evaluate(
        state
      );

    state.reflections.push(
      formatAutonomousLoopDecision(
        decision
      )
    );

    return state;
  }
}
