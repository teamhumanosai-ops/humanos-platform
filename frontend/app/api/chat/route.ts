import { NextResponse } from "next/server";

import { initializeBrain } from "@/brain/bootstrap/bootstrap";
import { orchestrate } from "@/brain/orchestrator";

type ChatMessage = {
  role: "user" | "assistant";
  message: string;
};

export async function POST(req: Request) {
  try {
    // Initialize Human OS once
    await initializeBrain();

    const body = await req.json();

    const messages: ChatMessage[] = body.messages ?? [];

    const response = await orchestrate(messages);

    return NextResponse.json({
      message: response,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}