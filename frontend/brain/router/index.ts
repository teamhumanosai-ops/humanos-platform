import { memorySkill } from "../skills/memorySkill";
import { noteSkill } from "../notes";

export async function executeSkills(
  message: string
): Promise<string | null> {
  const memoryResponse = memorySkill(message);

  if (memoryResponse) {
    return memoryResponse;
  }

  const noteResponse = await noteSkill(message);

  if (noteResponse) {
    return noteResponse;
  }

  return null;
}