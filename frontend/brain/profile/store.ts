import {
  eq,
} from "drizzle-orm";

import {
  db,
} from "../../database/db";

import {
  profiles,
} from "../../database/schema";

import {
  HumanProfile,
} from "./types";

/**
 * Persist a complete HumanProfile.
 *
 * The profile is stored as one canonical JSON document so the profile
 * domain can evolve without coupling every nested field to database columns.
 * The database row remains keyed by the profile id and is updated atomically.
 */
export function saveProfile(
  profileData: HumanProfile
): void {
  const serialized =
    JSON.stringify(
      profileData
    );

  db.insert(profiles)
    .values({
      id: profileData.id,
      data: serialized,
      createdAt:
        profileData.metadata.createdAt,
      updatedAt:
        profileData.metadata.updatedAt,
    })
    .onConflictDoUpdate({
      target:
        profiles.id,
      set: {
        data: serialized,
        updatedAt:
          profileData.metadata.updatedAt,
      },
    })
    .run();
}

/**
 * Return the most recently updated HumanProfile.
 */
export function getProfile():
  HumanProfile | null {
  const row =
    db.select()
      .from(profiles)
      .orderBy(
        profiles.updatedAt
      )
      .all()
      .at(-1);

  if (!row) {
    return null;
  }

  try {
    return JSON.parse(
      row.data
    ) as HumanProfile;
  } catch {
    return null;
  }
}

/**
 * Remove all persisted HumanProfile state.
 */
export function clearProfile(): void {
  db.delete(
    profiles
  ).run();
}

/**
 * Remove one persisted profile by id.
 */
export function deleteProfile(
  profileId: string
): void {
  db.delete(
    profiles
  )
    .where(
      eq(
        profiles.id,
        profileId
      )
    )
    .run();
}
