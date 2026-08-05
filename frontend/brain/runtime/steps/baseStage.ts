import { BrainState } from "../../brainState";
import { Stage } from "./stage";

/**
 * Base implementation for all Human OS cognitive stages.
 *
 * Every stage automatically:
 * - records execution
 * - updates timestamps
 * - captures failures
 */
export abstract class BaseStage implements Stage {
  abstract readonly name: string;

  async execute(
    state: BrainState
  ): Promise<BrainState> {
    const startedAt = Date.now();

    try {
      state.executedStages.push(this.name);

      const result = await this.process(state);

      result.updatedAt = new Date();

      console.debug(
        `[Runtime] ${this.name} (${Date.now() - startedAt} ms)`
      );

      return result;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : String(error);

      state.errors.push(
        `${this.name}: ${message}`
      );

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