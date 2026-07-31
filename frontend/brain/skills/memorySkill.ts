import { getMemories } from "../memory";

export function memorySkill(message: string): string | null {
  const lower = message.toLowerCase();

  const memories = getMemories();

  const getValue = (key: string) =>
    memories.find((m) => m.key === key)?.value;

  if (lower.includes("my name")) {
    const name = getValue("name");

    return name
      ? `Your name is ${name}.`
      : "I don't know your name yet.";
  }

  if (lower.includes("where do i live")) {
    const city = getValue("city");

    return city
      ? `You live in ${city}.`
      : "I don't know where you live yet.";
  }

  if (lower.includes("favorite color")) {
    const color = getValue("favorite_color");

    return color
      ? `Your favorite color is ${color}.`
      : "I don't know your favorite color yet.";
  }

  if (lower.includes("what am i building")) {
    const project = getValue("project");

    return project
      ? `You are building ${project}.`
      : "I don't know your current project yet.";
  }

  return null;
}