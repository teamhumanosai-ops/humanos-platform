import { getMemories } from "@/brain/memory";

export async function GET() {
  return Response.json(getMemories());
}