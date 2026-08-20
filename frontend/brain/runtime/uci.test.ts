import {
  executeCognitiveRequest,
  UCI_PROTOCOL_VERSION,
} from "./uci";

import {
  clearUciRequestRegistry,
} from "./uciRequestRegistry";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `UCI verification failed: ${message}`
    );
  }
}

async function expectFailure(
  request: unknown,
  expected: string
): Promise<void> {
  try {
    await executeCognitiveRequest(
      request as never
    );
    throw new Error(
      `Expected UCI request to fail: ${expected}`
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : String(error);

    assert(
      message === expected,
      `expected "${expected}" but received "${message}"`
    );
  }
}

async function runUciVerification(): Promise<void> {
  const request = {
    requestId:
      "uci-test-001",
    messages: [
      {
        role: "user" as const,
        message:
          "Validate the UCI boundary.",
      },
    ],
  };

  const response =
    await executeCognitiveRequest(
      request
    );

  assert(
    response.requestId ===
      "uci-test-001",
    "requestId must round-trip unchanged"
  );

  assert(
    response.protocolVersion ===
      UCI_PROTOCOL_VERSION,
    "response must expose the canonical UCI protocol version"
  );

  assert(
    response.state.userMessage ===
      "Validate the UCI boundary.",
    "validated messages must reach BrainState"
  );

  const duplicateResponse =
    await executeCognitiveRequest(
      request
    );

  assert(
    duplicateResponse ===
      response,
    "duplicate requestId and payload must reuse the registered execution result"
  );

  await expectFailure(
    {
      requestId:
        "uci-test-001",
      messages: [
        {
          role: "user",
          message:
            "Different payload must not reuse the same request id.",
        },
      ],
    },
    "UCI requestId \"uci-test-001\" was reused with a different request payload."
  );

  await expectFailure(
    {
      requestId: "",
      messages: [
        {
          role: "user",
          message: "hello",
        },
      ],
    },
    "UCI request requires a non-empty requestId."
  );

  await expectFailure(
    {
      requestId: "uci-empty",
      messages: [],
    },
    "UCI request requires at least one conversation message."
  );

  await expectFailure(
    {
      requestId: "uci-empty-message",
      messages: [
        {
          role: "user",
          message: "   ",
        },
      ],
    },
    "UCI message 0 cannot be empty."
  );

  await expectFailure(
    {
      requestId: "uci-invalid-role",
      messages: [
        {
          role: "system",
          message: "hello",
        },
      ],
    },
    "UCI message 0 has an unsupported role."
  );

  clearUciRequestRegistry();

  console.log(
    "UCI cognitive request boundary verification passed."
  );
}

runUciVerification().catch(
  (error) => {
    clearUciRequestRegistry();
    throw error;
  }
);
