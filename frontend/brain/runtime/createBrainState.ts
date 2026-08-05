import {
  BrainState,
  ConversationMessage,
  createBrainState,
} from "../brainState";

export function createRuntimeBrainState(
  messages: ConversationMessage[]
): BrainState {
  const conversation = messages
    .map(
      (m) =>
        `${m.role}: ${m.message}`
    )
    .join("\n");

  const lastUserMessage =
    [...messages]
      .reverse()
      .find(
        (m) => m.role === "user"
      )?.message ?? "";

  return createBrainState(
    conversation,
    messages,
    lastUserMessage
  );
}