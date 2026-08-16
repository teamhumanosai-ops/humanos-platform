import {
  Intent,
} from "../intent";

import {
  memorySkill,
} from "../skills/memorySkill";

import {
  noteSkill,
} from "../notes";

export async function executeSkills(
  message: string,
  intent: string | null
): Promise<string | null> {
  const memoryResponse =
    await memorySkill(
      message
    );

  if (
    memoryResponse
  ) {
    return memoryResponse;
  }

  if (
    intent !==
    Intent.NOTE_TAKING
  ) {
    return null;
  }

  const noteResponse =
    await noteSkill(
      message
    );

  if (
    noteResponse
  ) {
    return noteResponse;
  }

  return null;
}