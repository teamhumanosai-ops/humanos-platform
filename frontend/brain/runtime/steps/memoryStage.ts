import { BrainState } from "../../brainState";
import { BaseStage } from "./baseStage";

export class MemoryStage extends BaseStage {
  readonly name = "Memory";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    /**
     * Phase 1:
     * The stage currently performs no memory enrichment.
     *
     * Later this stage will:
     * - Extract memories
     * - Store memories
     * - Update BrainState flags
     */

    state.hasMemory = true;

    return state;
  }
}