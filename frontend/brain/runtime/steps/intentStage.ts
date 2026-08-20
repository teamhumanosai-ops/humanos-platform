import { BrainState } from "../../brainState";
import { BaseStage } from "./baseStage";
import { detectIntent } from "../../intent";

/**
 * IntentStage
 *
 * Responsible for detecting the user's intent
 * and enriching the BrainState.
 */
export class IntentStage extends BaseStage {
  readonly name = "Intent";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    const intent = detectIntent(
      state.userMessage
    ).toString();

    console.log(
      `[Intent] message=${JSON.stringify(state.userMessage)} intent=${intent}`
    );

    state.intent = intent;

    return state;
  }
}
