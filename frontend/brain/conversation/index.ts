export type ChatMessage = {
  role:
    | "user"
    | "assistant";

  message: string;
};

/**
 * Maximum number of recent turns retained in the runtime request.
 *
 * Older turns remain the responsibility of persistent memory,
 * timeline, graph, and future conversation summarization layers.
 */
export const MAX_MESSAGES = 20;

/**
 * Normalize the incoming conversation without changing message order.
 * Empty messages are discarded because they add no cognitive context.
 */
export function normalizeConversation(
  messages: ChatMessage[]
): ChatMessage[] {
  return messages
    .filter(
      (message) =>
        (message.role === "user" ||
          message.role === "assistant") &&
        message.message.trim().length > 0
    )
    .map(
      (message) => ({
        role: message.role,
        message: message.message.trim(),
      })
    );
}

/**
 * Prepare the bounded short-term conversation window used by the runtime.
 *
 * The returned array is a new value so callers cannot mutate the original
 * request payload through the prepared conversation reference.
 */
export function prepareConversation(
  messages: ChatMessage[]
): ChatMessage[] {
  const normalized =
    normalizeConversation(
      messages
    );

  return normalized.slice(
    -MAX_MESSAGES
  );
}

/**
 * Return the number of valid messages that were omitted from the runtime
 * window. This is useful for diagnostics and future summarization work.
 */
export function getOmittedMessageCount(
  messages: ChatMessage[]
): number {
  const normalized =
    normalizeConversation(
      messages
    );

  return Math.max(
    0,
    normalized.length -
      MAX_MESSAGES
  );
}
