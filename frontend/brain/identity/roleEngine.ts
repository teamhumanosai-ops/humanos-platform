export type HumanRole =
  | "general"
  | "software_engineer"
  | "chef"
  | "business_advisor"
  | "fitness_coach"
  | "relationship_coach"
  | "learning_mentor";

const roleKeywords: Record<HumanRole, string[]> = {
  general: [],

  software_engineer: [
    "code",
    "coding",
    "bug",
    "typescript",
    "javascript",
    "react",
    "nextjs",
    "api",
    "node",
    "python",
    "database",
    "frontend",
    "backend",
    "debug",
  ],

  chef: [
    "recipe",
    "cook",
    "food",
    "kitchen",
    "ingredients",
    "meal",
    "breakfast",
    "lunch",
    "dinner",
  ],

  business_advisor: [
    "startup",
    "business",
    "company",
    "revenue",
    "customer",
    "marketing",
    "sales",
    "pricing",
    "funding",
    "investor",
  ],

  fitness_coach: [
    "gym",
    "exercise",
    "workout",
    "protein",
    "weight",
    "fitness",
    "diet",
    "cardio",
  ],

  relationship_coach: [
    "wife",
    "girlfriend",
    "boyfriend",
    "relationship",
    "marriage",
    "love",
    "family",
  ],

  learning_mentor: [
    "study",
    "learn",
    "course",
    "exam",
    "interview",
    "practice",
    "education",
  ],
};

export class RoleEngine {
  detect(query: string): HumanRole {
    const text = query.toLowerCase();

    for (const [role, keywords] of Object.entries(roleKeywords)) {
      if (keywords.some((keyword) => text.includes(keyword))) {
        return role as HumanRole;
      }
    }

    return "general";
  }
}

export const roleEngine = new RoleEngine();