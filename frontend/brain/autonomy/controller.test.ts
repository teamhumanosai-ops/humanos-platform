import {
  createBrainState,
} from "../brainState";

import {
  AutonomousLoopController,
} from "./controller";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ACL-001 verification failed: ${message}`
    );
  }
}

function createState() {
  return createBrainState(
    "conversation",
    [],
    "What should I do next?"
  );
}

function verifyCompleteWithoutRecommendation(): void {
  const controller =
    new AutonomousLoopController();

  const decision =
    controller.evaluate(
      createState()
    );

  assert(
    decision.status ===
      "complete",
    "a state without recommendations must complete"
  );

  assert(
    decision.nextAction ===
      null,
    "completed cycles must not fabricate a next action"
  );
}

function verifyRecommendationContinuation(): void {
  const state =
    createState();

  state.recommendations = [
    {
      id: "recommendation-1",
      kind: "next_action",
      statement: "Review the next project milestone.",
      rationale: "The active evidence points to the milestone as the next useful action.",
      priority: 0.8,
      confidence: 0.85,
      evidence: [],
      createdAt: new Date(),
    },
  ];

  const controller =
    new AutonomousLoopController({
      maxIterations: 3,
    });

  const decision =
    controller.evaluate(
      state
    );

  assert(
    decision.status ===
      "continue",
    "an actionable recommendation must permit bounded continuation"
  );

  assert(
    decision.nextAction ===
      "Review the next project milestone.",
    "continuation must expose the ranked recommendation as the candidate next action"
  );

  assert(
    decision.recommendationId ===
      "recommendation-1",
    "continuation must preserve recommendation identity"
  );
}

function verifyFailureBlocksLoop(): void {
  const state =
    createState();

  state.errors.push(
    "runtime failure"
  );

  const decision =
    new AutonomousLoopController()
      .evaluate(
        state
      );

  assert(
    decision.status ===
      "blocked",
    "runtime errors must block autonomous continuation"
  );

  assert(
    decision.nextAction ===
      null,
    "blocked cycles must not expose an executable next action"
  );
}

function verifyIterationLimit(): void {
  const state =
    createState();

  state.recommendations = [
    {
      id: "recommendation-2",
      kind: "preparation",
      statement: "Prepare the upcoming renewal.",
      rationale: "The prediction indicates a likely deadline.",
      priority: 0.9,
      confidence: 0.9,
      evidence: [],
      createdAt: new Date(),
    },
  ];

  const controller =
    new AutonomousLoopController({
      maxIterations: 2,
    });

  controller.evaluate(
    state
  );

  const decision =
    controller.evaluate(
      state
    );

  assert(
    decision.status ===
      "max_iterations",
    "the loop must stop at its configured safety limit"
  );
}

function verifyReset(): void {
  const state =
    createState();

  const controller =
    new AutonomousLoopController({
      maxIterations: 3,
    });

  controller.evaluate(
    state
  );

  assert(
    controller.getIteration() ===
      1,
    "controller must track the current iteration"
  );

  controller.reset();

  assert(
    controller.getIteration() ===
      0,
    "reset must clear loop iteration state"
  );
}

verifyCompleteWithoutRecommendation();
verifyRecommendationContinuation();
verifyFailureBlocksLoop();
verifyIterationLimit();
verifyReset();
