import { BrainState } from "../../brainState";
import { BaseStage } from "./baseStage";
import { buildContext } from "../../context";

/**
 * ContextStage
 *
 * Builds the runtime context consumed by
 * reasoning and response stages.
 *
 * Existing Human OS context remains the
 * primary context builder. Runtime-provided
 * live knowledge is appended only when the
 * LiveKnowledgeStage produced results.
 */
export class ContextStage extends BaseStage {
  readonly name = "Context";

  protected async process(
    state: BrainState
  ): Promise<BrainState> {
    const baseContext =
      await buildContext(
        state.userMessage
      );

    if (
      state.liveKnowledge.length === 0
    ) {
      state.context =
        baseContext;

      return state;
    }

    const liveKnowledgeContext = `
Relevant Live Web Information:

${state.liveKnowledge.join(
  "\n\n"
)}

The information above was retrieved from the web for this request.

Use it when answering current-information questions.
Do not present unavailable or unsupported details as facts.
`;

    state.context = `${baseContext}

${liveKnowledgeContext}`;

    return state;
  }
}