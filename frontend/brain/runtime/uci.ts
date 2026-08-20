import type {
  ConversationMessage,
} from "../brainState";

import {
  executeRuntime,
} from "./execute";

import {
  clearRegisteredRequest,
  getRegisteredRequest,
  registerRequest,
} from "./uciRequestRegistry";

export const UCI_PROTOCOL_VERSION =
  "uci-1";

export type CognitiveRequest = {
  requestId: string;
  messages: ConversationMessage[];
};

export type CognitiveResponse = {
  requestId: string;
  protocolVersion: string;
  state: Awaited<
    ReturnType<typeof executeRuntime>
  >;
};

const MAX_MESSAGES =
  100;

const MAX_MESSAGE_LENGTH =
  20000;

function normalizeRequestId(
  requestId: string
): string {
  const normalized =
    requestId.trim();

  if (!normalized) {
    throw new Error(
      "UCI request requires a non-empty requestId."
    );
  }

  return normalized;
}

function validateMessages(
  messages: ConversationMessage[]
): void {
  if (
    !Array.isArray(messages) ||
    messages.length === 0
  ) {
    throw new Error(
      "UCI request requires at least one conversation message."
    );
  }

  if (
    messages.length >
    MAX_MESSAGES
  ) {
    throw new Error(
      `UCI request cannot contain more than ${MAX_MESSAGES} messages.`
    );
  }

  for (
    const [index, message] of
    messages.entries()
  ) {
    if (
      !message ||
      typeof message !== "object"
    ) {
      throw new Error(
        `UCI message ${index} must be an object.`
      );
    }

    if (
      message.role !== "user" &&
      message.role !== "assistant"
    ) {
      throw new Error(
        `UCI message ${index} has an unsupported role.`
      );
    }

    if (
      typeof message.message !==
      "string"
    ) {
      throw new Error(
        `UCI message ${index} must contain text.`
      );
    }

    if (
      message.message.trim().length ===
      0
    ) {
      throw new Error(
        `UCI message ${index} cannot be empty.`
      );
    }

    if (
      message.message.length >
      MAX_MESSAGE_LENGTH
    ) {
      throw new Error(
        `UCI message ${index} exceeds the ${MAX_MESSAGE_LENGTH} character limit.`
      );
    }
  }
}

function snapshotMessages(
  messages: ConversationMessage[]
): ConversationMessage[] {
  return messages.map(
    (message) => ({
      role: message.role,
      message: message.message,
    })
  );
}

function fingerprintMessages(
  messages: ConversationMessage[]
): string {
  return JSON.stringify(
    messages.map(
      (message) => ({
        role: message.role,
        message: message.message,
      })
    )
  );
}

/**
 * Canonical Universal Cognitive Interface boundary.
 *
 * All external callers that need a request/response contract can use this
 * entrypoint without owning CognitiveRuntime or BrainState construction.
 * Validation occurs before any runtime stage or provider can execute.
 * Request ids are idempotent for the bounded lifetime of the process.
 * Failed executions release their registration so transient failures can retry.
 * The validated message payload is snapshotted before async execution so
 * caller-side mutation cannot alter the in-flight cognitive request.
 */
export async function executeCognitiveRequest(
  request: CognitiveRequest
): Promise<CognitiveResponse> {
  if (
    !request ||
    typeof request !== "object"
  ) {
    throw new Error(
      "UCI request must be an object."
    );
  }

  const requestId =
    normalizeRequestId(
      request.requestId
    );

  validateMessages(
    request.messages
  );

  const messages =
    snapshotMessages(
      request.messages
    );

  const fingerprint =
    fingerprintMessages(
      messages
    );

  const registered =
    getRegisteredRequest(
      requestId,
      fingerprint
    );

  if (registered) {
    return registered;
  }

  const execution =
    executeRuntime(
      messages
    ).then(
      (state) => ({
        requestId,
        protocolVersion:
          UCI_PROTOCOL_VERSION,
        state,
      })
    );

  registerRequest(
    requestId,
    fingerprint,
    execution
  );

  return execution.catch(
    (error) => {
      clearRegisteredRequest(
        requestId,
        fingerprint
      );

      throw error;
    }
  );
}
