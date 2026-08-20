import {
  formatAutonomousLoopDecision,
} from "./summary";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `ACL-001 summary verification failed: ${message}`
    );
  }
}

const formatted =
  formatAutonomousLoopDecision({
    status: "continue",
    reason:
      "A ranked recommendation provides a candidate next cognitive action.",
    nextAction:
      "Review the next project milestone.",
    recommendationId:
      "recommendation-1",
    iteration: 1,
    maxIterations: 3,
  });

assert(
  formatted.includes(
    "Autonomous Loop: continue"
  ),
  "summary must expose loop status"
);

assert(
  formatted.includes(
    "Iteration: 1/3"
  ),
  "summary must expose iteration bounds"
);

assert(
  formatted.includes(
    "Candidate Next Action: Review the next project milestone."
  ),
  "summary must expose the candidate action"
);

assert(
  formatted.includes(
    "Recommendation ID: recommendation-1"
  ),
  "summary must preserve recommendation identity"
);
