import { HumanProfile } from "./types";
import {
  saveProfile,
  getProfile,
  clearProfile,
} from "./store";

function mergeProfile(
  profile: HumanProfile,
  data: Partial<HumanProfile>
): HumanProfile {
  return {
    ...profile,

    identity: {
      ...profile.identity,
      ...data.identity,
    },

    mission: {
      ...profile.mission,
      ...data.mission,
    },

    personality: {
      ...profile.personality,
      ...data.personality,
    },

    productivity: {
      ...profile.productivity,
      ...data.productivity,
    },

    interests: {
      ...profile.interests,
      ...data.interests,
    },

    metadata: {
      ...profile.metadata,
      ...data.metadata,
      updatedAt:
        new Date().toISOString(),
    },
  };
}

export class ProfileEngine {
  create(
    data: Partial<HumanProfile>
  ): HumanProfile {
    const now =
      new Date().toISOString();

    const profile: HumanProfile = {
      id:
        crypto.randomUUID(),

      identity: {
        fullName:
          data.identity?.fullName ??
          "",
        preferredName:
          data.identity?.preferredName,
        age:
          data.identity?.age,
        country:
          data.identity?.country,
        timezone:
          data.identity?.timezone,
      },

      mission: {
        lifeMission:
          data.mission?.lifeMission,
        currentMission:
          data.mission?.currentMission,
        biggestGoal:
          data.mission?.biggestGoal,
        currentProject:
          data.mission?.currentProject,
      },

      personality: {
        communicationStyle:
          data.personality
            ?.communicationStyle,
        learningStyle:
          data.personality
            ?.learningStyle,
        decisionStyle:
          data.personality
            ?.decisionStyle,
      },

      productivity: {
        bestWorkingHours:
          data.productivity
            ?.bestWorkingHours,
        biggestDistraction:
          data.productivity
            ?.biggestDistraction,
        planningStyle:
          data.productivity
            ?.planningStyle,
      },

      interests: {
        favoriteTopics:
          data.interests
            ?.favoriteTopics ??
          [],
        favoriteBooks:
          data.interests
            ?.favoriteBooks ??
          [],
        favoriteCreators:
          data.interests
            ?.favoriteCreators ??
          [],
      },

      metadata: {
        createdAt: now,
        updatedAt: now,
      },
    };

    saveProfile(
      profile
    );

    return profile;
  }

  get():
    HumanProfile | null {
    return getProfile();
  }

  update(
    data: Partial<HumanProfile>
  ): void {
    const profile =
      getProfile();

    if (!profile) {
      return;
    }

    saveProfile(
      mergeProfile(
        profile,
        data
      )
    );
  }

  clear(): void {
    clearProfile();
  }
}

export const profileEngine =
  new ProfileEngine();
