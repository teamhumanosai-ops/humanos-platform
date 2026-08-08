import { BrainState } from "../../brainState";

import { RuntimeServices } from "../runtimeServices";

import { BaseStage } from "./baseStage";

/**
 * Final stage of the Human OS cognitive workflow.
 *
 * Responsibilities:
 * - Return an existing local skill response when available
 * - Generate an AI response when no local response exists
 * - Provide the reasoning result to the AI service
 * - Store the final response in BrainState
 * - Finalize runtime response metadata
 */
export class ResponseStage
  extends BaseStage {
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
     * A previous stage may already have
     * produced a final response.
     *
     * Never call the AI service twice.
     */
    if (state.response) {
      state.updatedAt =
        new Date();

      return state;
    }

    /**
     * Reasoning is produced by the
     * ReasoningStage and stored in the
     * shared BrainState.
     *
     * ResponseStage does not perform
     * reasoning itself.
     *
     * It only makes the reasoning result
     * available to the response generator.
     */
    const reasoningContext =
      state.reasoning
        ? `
Cognitive Reasoning:

${state.reasoning}

Use this reasoning as internal cognitive context when generating the response.

Do not expose internal reasoning, confidence scores, or implementation details unless the user explicitly asks for an explanation of how Human OS reached its conclusion.
`
        : "";

    const responseContext = [
      state.context ?? "",
      reasoningContext,
    ]
      .filter(
        (value) =>
          value.trim().length > 0
      )
      .join("\n\n");

    /**
     * Generate the final response using:
     *
     * 1. Structured cognitive context
     * 2. Reasoning produced by the runtime
     * 3. Complete conversation history
     */
    state.response =
      await this.services.aiService(
        responseContext,
        state.messages
      );

    state.updatedAt =
      new Date();

    return state;
  }
}