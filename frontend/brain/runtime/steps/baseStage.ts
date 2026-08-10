import { BrainState } from "../../brainState";
import { createStageDiagnostic } from "../diagnostics";
import { Stage } from "./stage";

/**
 * Base implementation for all Human OS cognitive stages.
 *
 * Every stage automatically:
 * - records execution
 * - records diagnostics
 * - updates timestamps
 * - captures failures
 */
export abstract class BaseStage implements Stage {
  abstract readonly name: string;

  async execute(
    state: BrainState
  ): Promise<BrainState> {
    const startedAt =
      new Date();

    state.executedStages.push(
      this.name
    );

    try {
      const result =
        await this.process(
          state
        );

      const completedAt =
        new Date();

      result.diagnostics.push(
        createStageDiagnostic(
          this.name,
          startedAt,
          completedAt
        )
      );

      result.updatedAt =
        completedAt;

      console.debug(
        `[Runtime] ${this.name} (${completedAt.getTime() - startedAt.getTime()} ms)`
      );

      return result;
    } catch (error) {
      const completedAt =
        new Date();

      const message =
        error instanceof Error
          ? error.message
          : String(error);

      state.errors.push(
        `${this.name}: ${message}`
      );

      state.diagnostics.push(
        createStageDiagnostic(
          this.name,
          startedAt,
          completedAt,
          message
        )
      );

      state.updatedAt =
        completedAt;

      console.error(
        `[Runtime] ${this.name} failed`,
        error
      );

      throw error;
    }
  }

  protected abstract process(
    state: BrainState
  ): Promise<BrainState>;
}