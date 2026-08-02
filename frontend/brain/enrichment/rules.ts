export type EnrichmentField =
  | "identity.preferredName"
  | "identity.country"
  | "identity.timezone"
  | "identity.age"
  | "mission.lifeMission"
  | "mission.currentMission"
  | "mission.biggestGoal"
  | "mission.currentProject"
  | "personality.communicationStyle"
  | "personality.learningStyle"
  | "personality.decisionStyle"
  | "productivity.bestWorkingHours"
  | "productivity.biggestDistraction"
  | "productivity.planningStyle"
  | "interests.favoriteTopics"
  | "interests.favoriteBooks"
  | "interests.favoriteCreators";

export interface EnrichmentRule {
  field: EnrichmentField;
  priority: number;
}

export const enrichmentRules: EnrichmentRule[] = [
  // -------------------------
  // Identity
  // -------------------------

  {
    field: "identity.preferredName",
    priority: 1,
  },

  {
    field: "identity.country",
    priority: 2,
  },

  {
    field: "identity.timezone",
    priority: 3,
  },

  {
    field: "identity.age",
    priority: 4,
  },

  // -------------------------
  // Mission
  // -------------------------

  {
    field: "mission.lifeMission",
    priority: 5,
  },

  {
    field: "mission.currentMission",
    priority: 6,
  },

  {
    field: "mission.biggestGoal",
    priority: 7,
  },

  {
    field: "mission.currentProject",
    priority: 8,
  },

  // -------------------------
  // Personality
  // -------------------------

  {
    field: "personality.communicationStyle",
    priority: 9,
  },

  {
    field: "personality.learningStyle",
    priority: 10,
  },

  {
    field: "personality.decisionStyle",
    priority: 11,
  },

  // -------------------------
  // Productivity
  // -------------------------

  {
    field: "productivity.bestWorkingHours",
    priority: 12,
  },

  {
    field: "productivity.biggestDistraction",
    priority: 13,
  },

  {
    field: "productivity.planningStyle",
    priority: 14,
  },

  // -------------------------
  // Interests
  // -------------------------

  {
    field: "interests.favoriteTopics",
    priority: 15,
  },

  {
    field: "interests.favoriteBooks",
    priority: 16,
  },

  {
    field: "interests.favoriteCreators",
    priority: 17,
  },
];