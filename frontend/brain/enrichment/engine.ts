import { HumanProfile } from "../profile/types";
import {
  enrichmentRules,
  EnrichmentField,
} from "./rules";
import { enrichmentPrompts } from "./prompts";

export interface EnrichmentSuggestion {
  field: EnrichmentField;
  prompt: string;
  priority: number;
}

export class EnrichmentEngine {
  getNextQuestion(
    profile: HumanProfile
  ): EnrichmentSuggestion | null {
    const sortedRules = [...enrichmentRules].sort(
      (a, b) => a.priority - b.priority
    );

    for (const rule of sortedRules) {
      if (this.isMissing(profile, rule.field)) {
        return {
          field: rule.field,
          prompt:
            enrichmentPrompts[rule.field],
          priority: rule.priority,
        };
      }
    }

    return null;
  }

  private isMissing(
    profile: HumanProfile,
    field: EnrichmentField
  ): boolean {
    const path = field.split(".");

    let current: unknown = profile;

    for (const key of path) {
      if (
        current === null ||
        current === undefined ||
        typeof current !== "object"
      ) {
        return true;
      }

      current = (
        current as Record<
          string,
          unknown
        >
      )[key];
    }

    if (Array.isArray(current)) {
      return current.length === 0;
    }

    return (
      current === undefined ||
      current === null ||
      current === ""
    );
  }
}

export const enrichmentEngine =
  new EnrichmentEngine();