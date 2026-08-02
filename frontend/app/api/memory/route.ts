import { getMemories } from "@/brain/memory";

export async function GET() {
  const memories = await getMemories();

  return Response.json(memories);
}