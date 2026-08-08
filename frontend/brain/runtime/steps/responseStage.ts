import { BrainState } from "../../brainState";
import { RuntimeServices } from "../runtimeServices";
import { BaseStage } from "./baseStage";

/**
 * Final stage of the Human OS cognitive workflow.
 *
 * Responsibilities:
 * - Return an existing local skill response when available
 * - Generate an AI response when no local response exists
 * - Store the final response in BrainState
 * - Finalize runtime response metadata
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
    /**
     * SkillStage may already have produced a
     * local response. In that case, do not call
     * the AI service again.
     */
    if (state.response) {
      state.updatedAt = new Date();

      return state;
    }

    /**
     * Generate the final AI response using the
     * context and complete conversation history
     * already stored in BrainState.
     */
    state.response =
      await this.services.aiService(
        state.context ?? "",
        state.messages
      );

    state.updatedAt = new Date();

    return state;
  }
}