import { BrainState } from "../../brainState";
import { BaseStage } from "./baseStage";
import { executeSkills } from "../../router";
import { formatResponse } from "../../formatter";

/**
 * SkillStage
 *
 * Executes local skills (memory queries, note taking,
 * planning shortcuts) before falling through to the
 * AI service.
 *
 * If a skill produces a local response, it is stored
 * in BrainState.response so that the ResponseStage
 * can skip the AI call.
 */
export class SkillStage extends BaseStage {
  readonly name = "Skill";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    const localResponse =
      await executeSkills(state.userMessage);

    if (localResponse) {
      state.response =
        formatResponse(localResponse);
    }

    return state;
  }
}
