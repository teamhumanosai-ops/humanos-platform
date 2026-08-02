import { profileEngine } from "../profile/profileEngine";

export function buildProfileContext(): string {
  const profile = profileEngine.get();

  if (!profile) {
    return "";
  }

  // Phase 1:
  // Profile context is intentionally empty.
  // We'll populate it when we inject Digital DNA.
  return "";
}