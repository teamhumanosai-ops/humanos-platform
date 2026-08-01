import { HumanProfile } from "./types";
import {
  saveProfile,
  getProfile,
  clearProfile,
} from "./store";

export class ProfileEngine {
  create(data: Partial<HumanProfile>): HumanProfile {
    const now = new Date().toISOString();

    const profile: HumanProfile = {
      id: crypto.randomUUID(),

      name: data.name ?? "",

      preferredName: data.preferredName,

      mission: data.mission,

      biggestGoal: data.biggestGoal,

      communicationStyle: data.communicationStyle,

      createdAt: now,

      updatedAt: now,
    };

    saveProfile(profile);

    return profile;
  }

  get(): HumanProfile | null {
    return getProfile();
  }

  update(data: Partial<HumanProfile>): void {
    const profile = getProfile();

    if (!profile) {
      return;
    }

    saveProfile({
      ...profile,
      ...data,
      updatedAt: new Date().toISOString(),
    });
  }

  clear(): void {
    clearProfile();
  }
}

export const profileEngine = new ProfileEngine();