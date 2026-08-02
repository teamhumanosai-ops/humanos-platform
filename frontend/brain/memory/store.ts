import { eq } from "drizzle-orm";

import { db } from "@/database/db";
import { memories } from "@/database/schema";
import type { MemoryItem } from "./types";

export async function saveMemory(
  key: string,
  value: string,
  confidence = 1
): Promise<void> {
  const existing = await db
    .select()
    .from(memories)
    .where(eq(memories.key, key));

  if (existing.length > 0) {
    await db
      .update(memories)
      .set({
        value,
        confidence,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(memories.key, key));

    return;
  }

  await db.insert(memories).values({
    key,
    value,
    confidence,
    updatedAt: new Date().toISOString(),
  });
}

export async function loadMemories(): Promise<
  MemoryItem[]
> {
  return await db.select().from(memories);
}

/**
 * Compatibility wrapper for the legacy API.
 */
export async function getMemories(): Promise<
  MemoryItem[]
> {
  return loadMemories();
}

/**
 * Compatibility wrapper for the legacy API.
 */
export async function getMemory(
  key: string
): Promise<MemoryItem | undefined> {
  const list = await loadMemories();

  return list.find((m) => m.key === key);
}

/**
 * Compatibility wrapper for the legacy API.
 */
export async function remember(
  key: string,
  value: string,
  confidence = 1
): Promise<void> {
  await saveMemory(
    key,
    value,
    confidence
  );
}