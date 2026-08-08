import { BrainState } from "../../brainState";
import { BaseStage } from "./baseStage";
import type { RuntimeServices } from "../runtimeServices";

/**
 * Final stage of the Human OS cognitive workflow.
 *
 * Responsibilities:
 * - Generate the AI response
 * - Preserve responses produced by local skills
 * - Finalize BrainState
 */
export class ResponseStage extends BaseStage {
  readonly name = "Response";

  constructor(
    private readonly services: RuntimeServices
  ) {
    super();
  }

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    if (!state.response) {
      state.response =
        await this.services.aiService(
          state.context ?? "",
          state.messages
        );
    }

    return state;
  }
}