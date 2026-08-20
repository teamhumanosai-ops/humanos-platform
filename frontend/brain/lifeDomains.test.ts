import {
  LIFE_DOMAINS,
  getLifeDomain,
  isLifeDomainId,
  resolveLifeDomains,
} from "./lifeDomains";

function assert(
  condition: boolean,
  message: string
): void {
  if (!condition) {
    throw new Error(
      `Life domain verification failed: ${message}`
    );
  }
}

assert(
  Object.isFrozen(LIFE_DOMAINS),
  "canonical life-domain registry must be frozen"
);

assert(
  Object.isFrozen(LIFE_DOMAINS[0]),
  "canonical life-domain entries must be frozen"
);

assert(
  Object.isFrozen(LIFE_DOMAINS[0]?.aliases),
  "canonical life-domain aliases must be frozen"
);

const work =
  resolveLifeDomains(
    "I need to prepare for a career meeting with my boss at work."
  );

assert(
  work[0]?.domain === "work",
  "work intent should resolve to the work domain"
);

const finance =
  resolveLifeDomains(
    "Compare my budget, bank account, and investment options."
  );

assert(
  finance[0]?.domain === "finance",
  "money-related requests should resolve to finance"
);

const travel =
  resolveLifeDomains(
    "Plan my flight, hotel, and vacation itinerary."
  );

assert(
  travel[0]?.domain === "travel",
  "trip-related requests should resolve to travel"
);

const multiple =
  resolveLifeDomains(
    "I have a work project with a deadline and need to decide what to prioritize."
  );

assert(
  multiple.length <= 3,
  "domain resolution must remain bounded"
);

assert(
  multiple.some(
    (match) =>
      match.domain === "projects"
  ),
  "project signals should remain available as a secondary domain"
);

assert(
  getLifeDomain("health").label ===
    "Health",
  "domain registry must expose canonical metadata"
);

assert(
  isLifeDomainId("health"),
  "canonical domain identifiers must be recognized"
);

assert(
  !isLifeDomainId("not-a-domain"),
  "unknown identifiers must be rejected"
);

const unknown =
  resolveLifeDomains(
    "Explain the history of this phrase."
  );

assert(
  unknown[0]?.domain === "general",
  "unmatched requests must remain in the general domain"
);

const boundaryFalsePositive =
  resolveLifeDomains(
    "The taxi route is already planned and the classic design is finished."
  );

assert(
  boundaryFalsePositive[0]?.domain === "general",
  "domain aliases must not match inside unrelated words"
);

const financeBoundaryFalsePositive =
  resolveLifeDomains(
    "The taxi is waiting outside the office."
  );

assert(
  financeBoundaryFalsePositive.some(
    (match) =>
      match.domain === "work"
  ),
  "a real office alias should still resolve when another word contains a finance alias"
);

assert(
  !financeBoundaryFalsePositive.some(
    (match) =>
      match.domain === "finance"
  ),
  "tax must not match inside taxi"
);

const studyBoundaryFalsePositive =
  resolveLifeDomains(
    "The classic design is finished."
  );

assert(
  studyBoundaryFalsePositive[0]?.domain === "general",
  "class must not match inside classic"
);

const punctuationBoundary =
  resolveLifeDomains(
    "Should I compare these options?"
  );

assert(
  punctuationBoundary[0]?.domain === "decisions",
  "multi-word aliases must match across punctuation boundaries"
);

console.log(
  "Life domain verification passed."
);
