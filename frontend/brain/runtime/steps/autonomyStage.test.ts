import {
  createBrainState,
} from "../../brainState";

import {
  AutonomyStage,
} from "./autonomyStage";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ACL-001 autonomy stage verification failed: ${message}`
    );
  }
}

async function verifyCandidateIsRecordedWithoutExecution(): Promise<void> {
  const state =
    createBrainState(
      "conversation",
      [],
      "What should I do next?"
    );

  state.recommendations = [
    {
      id: "recommendation-1",
      kind: "next_action",
      statement: "Review the next project milestone.",
      rationale: "The current evidence supports this as the next useful action.",
      priority: 0.8,
      confidence: 0.85,
      evidence: [],
      createdAt: new Date(),
    },
  ];

  const stage =
    new AutonomyStage();

  const result =
    await stage.execute(
      state
    );

  assert(
    result.reflections.length ===
      1,
    "autonomy stage must record one decision summary"
  );

  assert(
    result.reflections[0].includes(
      "Autonomous Loop: continue"
    ),
    "autonomy stage must record the loop status"
  );

  assert(
    result.reflections[0].includes(
      "Candidate Next Action: Review the next project milestone."
    ),
    "autonomy stage must record the candidate action"
  );

  assert(
    result.execution ===
      null,
    "autonomy stage must not execute the candidate action"
  );

  assert(
    result.currentExecutionId ===
      null,
    "autonomy stage must not create an execution"
  );
}

verifyCandidateIsRecordedWithoutExecution();
