import {
  getLifeDomain,
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

const unknown =
  resolveLifeDomains(
    "Explain the history of this phrase."
  );

assert(
  unknown[0]?.domain === "general",
  "unmatched requests must remain in the general domain"
);

console.log(
  "Life domain verification passed."
);
