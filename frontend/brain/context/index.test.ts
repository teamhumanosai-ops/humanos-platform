import {
  createBrainState,
} from "../brainState";

import {
  buildContext,
} from "./index";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Context prediction verification failed: ${message}`
    );
  }
}

async function verifyPredictionsEnterContext(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "What should I do next?"
    );

  state.predictions = [
    {
      id: "prediction-runtime",
      kind: "upcoming_task",
      statement:
        "The next likely action is to validate the runtime.",
      confidence: 0.86,
      evidence: [
        {
          source: "timeline",
          statement:
            "Runtime validation is scheduled next.",
          confidence: 0.86,
        },
      ],
      createdAt: new Date(),
    },
  ];

  const context =
    await buildContext(
      state
    );

  assert(
    context.predictions.includes(
      "The next likely action is to validate the runtime."
    ),
    "structured context must include prediction statements"
  );

  assert(
    context.prompt.includes(
      "Relevant Predictions:"
    ),
    "final context prompt must include the prediction section"
  );

  assert(
    context.prompt.includes(
      "Confidence: 0.86"
    ),
    "prediction confidence must be preserved in the prompt"
  );
}

async function verifyEmptyPredictionsDoNotAddSection(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "Hello"
    );

  state.predictions = [];

  const context =
    await buildContext(
      state
    );

  assert(
    context.predictions === "",
    "empty predictions must produce an empty structured prediction section"
  );

  assert(
    !context.prompt.includes(
      "Relevant Predictions:"
    ),
    "empty predictions must not add speculative prediction instructions"
  );
}

async function runVerification(): Promise<void> {
  await verifyPredictionsEnterContext();
  await verifyEmptyPredictionsDoNotAddSection();

  console.log(
    "Context prediction verification passed."
  );
}

void runVerification();
