import type { BrainState } from "../brainState";

import {
  evaluateAutonomousLoop,
} from "./policy";

import type {
  AutonomousLoopDecision,
  AutonomousLoopOptions,
} from "./types";

export class AutonomousLoopController {
  private iteration = 0;

  constructor(
    private readonly options: AutonomousLoopOptions = {}
  ) {}

  reset(): void {
    this.iteration = 0;
  }

  evaluate(
    state: BrainState
  ): AutonomousLoopDecision {
    const nextIteration =
      this.iteration + 1;

    const decision =
      evaluateAutonomousLoop(
        state,
        {
          ...this.options,
          iteration:
            nextIteration,
        }
      );

    this.iteration =
      decision.iteration;

    return decision;
  }

  getIteration(): number {
    return this.iteration;
  }
}
