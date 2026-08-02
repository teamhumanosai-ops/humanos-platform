import { memorySkill } from "../skills";

export async function executeSkills(
  message: string
): Promise<string | null> {
  const memoryResult = await memorySkill(message);

  if (memoryResult) {
    return memoryResult;
  }

  return null;
}