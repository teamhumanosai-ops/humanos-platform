import { HumanProfile } from "./types";

let profile: HumanProfile | null = null;

export function saveProfile(profileData: HumanProfile): void {
  profile = profileData;
}

export function getProfile(): HumanProfile | null {
  return profile;
}

export function clearProfile(): void {
  profile = null;
}