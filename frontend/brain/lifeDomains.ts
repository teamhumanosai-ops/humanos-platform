export type LifeDomainId =
  | "work"
  | "business"
  | "study"
  | "travel"
  | "shopping"
  | "finance"
  | "health"
  | "household"
  | "projects"
  | "goals"
  | "learning"
  | "decisions"
  | "personal"
  | "general";

export type LifeDomain = {
  readonly id: LifeDomainId;
  readonly label: string;
  readonly description: string;
  readonly aliases: readonly string[];
};

export type LifeDomainMatch = {
  domain: LifeDomainId;
  score: number;
  matchedTerms: string[];
};

export const LIFE_DOMAINS: readonly LifeDomain[] = Object.freeze([
  {
    id: "work",
    label: "Work",
    description: "Employment, career execution, and professional responsibilities.",
    aliases: ["work", "job", "career", "office", "coworker", "boss", "employee"],
  },
  {
    id: "business",
    label: "Business",
    description: "Companies, entrepreneurship, customers, operations, and growth.",
    aliases: ["business", "company", "startup", "founder", "customer", "sales", "revenue"],
  },
  {
    id: "study",
    label: "Study",
    description: "Formal education, coursework, exams, and academic work.",
    aliases: ["study", "school", "college", "university", "exam", "course", "class"],
  },
  {
    id: "travel",
    label: "Travel",
    description: "Trips, transportation, lodging, destinations, and itineraries.",
    aliases: ["travel", "trip", "flight", "hotel", "vacation", "itinerary", "airport"],
  },
  {
    id: "shopping",
    label: "Shopping",
    description: "Products, purchases, comparisons, orders, and shopping decisions.",
    aliases: ["shopping", "buy", "purchase", "order", "product", "price", "store"],
  },
  {
    id: "finance",
    label: "Finance",
    description: "Money management, budgets, investing, banking, and financial decisions.",
    aliases: ["finance", "money", "budget", "bank", "invest", "investment", "tax"],
  },
  {
    id: "health",
    label: "Health",
    description: "Health, wellness, appointments, fitness, and personal care.",
    aliases: ["health", "doctor", "medical", "medicine", "fitness", "workout", "wellness"],
  },
  {
    id: "household",
    label: "Household",
    description: "Home operations, maintenance, chores, utilities, and household logistics.",
    aliases: ["home", "house", "household", "rent", "utility", "repair", "chore"],
  },
  {
    id: "projects",
    label: "Projects",
    description: "Multi-step initiatives, deliverables, milestones, and project execution.",
    aliases: ["project", "milestone", "deliverable", "initiative", "sprint", "deadline"],
  },
  {
    id: "goals",
    label: "Goals",
    description: "Personal objectives, progress tracking, priorities, and outcomes.",
    aliases: ["goal", "objective", "target", "priority", "progress", "achievement"],
  },
  {
    id: "learning",
    label: "Learning",
    description: "Skill development, self-directed learning, practice, and knowledge growth.",
    aliases: ["learn", "learning", "skill", "practice", "tutorial", "coursework", "knowledge"],
  },
  {
    id: "decisions",
    label: "Decisions",
    description: "Choices, tradeoffs, evaluations, and decision support across life domains.",
    aliases: ["decision", "decide", "choice", "tradeoff", "compare", "should i", "whether"],
  },
  {
    id: "personal",
    label: "Personal",
    description: "Personal matters that do not fit a more specific domain.",
    aliases: ["personal", "family", "friend", "relationship", "birthday", "life"],
  },
  {
    id: "general",
    label: "General",
    description: "Cross-domain or currently unclassified cognitive work.",
    aliases: [],
  },
].map(
  (domain) =>
    Object.freeze({
      ...domain,
      aliases: Object.freeze([
        ...domain.aliases,
      ]),
    })
  ) as readonly LifeDomain[]);

const DOMAIN_MAP = new Map(
  LIFE_DOMAINS.map((domain) => [domain.id, domain])
);

export function isLifeDomainId(
  value: string
): value is LifeDomainId {
  return DOMAIN_MAP.has(
    value as LifeDomainId
  );
}

export function getLifeDomain(
  id: LifeDomainId
): LifeDomain {
  return DOMAIN_MAP.get(id) ?? DOMAIN_MAP.get("general")!;
}

/**
 * Normalize request text for alias matching without allowing an alias
 * to match inside a larger unrelated word. Punctuation becomes a word
 * boundary so phrases such as "should I" still match naturally.
 */
function normalizeForAliasMatching(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Match a single alias against normalized request text using explicit
 * token boundaries. This prevents false positives such as "tax" inside
 * "taxi" or "class" inside "classic" while preserving multi-word aliases.
 */
function matchesAlias(
  normalizedText: string,
  alias: string
): boolean {
  const normalizedAlias =
    normalizeForAliasMatching(alias);

  if (!normalizedAlias) {
    return false;
  }

  const escapedAlias =
    normalizedAlias.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

  return new RegExp(
    `(^|\\s)${escapedAlias}(?=\\s|$)`,
    "u"
  ).test(
    normalizedText
  );
}

export function resolveLifeDomains(
  text: string,
  limit = 3
): LifeDomainMatch[] {
  const normalized =
    normalizeForAliasMatching(text);

  if (!normalized) {
    return [
      {
        domain: "general",
        score: 0,
        matchedTerms: [],
      },
    ];
  }

  const matches = LIFE_DOMAINS
    .filter((domain) => domain.id !== "general")
    .map((domain) => {
      const matchedTerms = domain.aliases.filter((alias) =>
        matchesAlias(normalized, alias)
      );

      return {
        domain: domain.id,
        score: matchedTerms.length,
        matchedTerms,
      };
    })
    .filter((match) => match.score > 0)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.domain.localeCompare(right.domain);
    })
    .slice(0, Math.max(1, limit));

  return matches.length > 0
    ? matches
    : [
        {
          domain: "general",
          score: 0,
          matchedTerms: [],
        },
      ];
}
