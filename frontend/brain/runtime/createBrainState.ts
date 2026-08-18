import {
  BrainState,
  ConversationMessage,
  createBrainState,
} from "../brainState";

import {
  buildConversationContinuitySummary,
  prepareConversation,
} from "../conversation";

export function createRuntimeBrainState(
  messages: ConversationMessage[]
): BrainState {
  const preparedMessages =
    prepareConversation(
      messages
    );

  const conversation =
    preparedMessages
      .map(
        (message) =>
          `${message.role}: ${message.message}`
      )
      .join("\n");

  const conversationContinuity =
    buildConversationContinuitySummary(
      messages
    );

  const lastUserMessage =
    [...preparedMessages]
      .reverse()
      .find(
        (message) =>
          message.role ===
          "user"
      )?.message ?? "";

  return createBrainState(
    conversation,
    preparedMessages,
    lastUserMessage,
    conversationContinuity
  );
}
