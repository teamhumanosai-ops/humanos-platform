import { NextResponse } from "next/server";

import {
  orchestrate,
} from "@/brain/orchestrator";

import {
  runMultimodalInput,
} from "@/brain/core/multimodalService";

import type {
  MultimodalInput,
} from "@/brain/core/multimodalContracts";

type ChatMessage = {
  role: "user" | "assistant";
  message: string;
};

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();

    const messages: ChatMessage[] =
      Array.isArray(body.messages)
        ? body.messages
        : [];

    const multimodal =
      body.multimodal as
        | MultimodalInput
        | undefined;

    if (multimodal) {
      const message =
        await runMultimodalInput(
          multimodal
        );

      return NextResponse.json({
        message,
        citations: [],
        recommendations: [],
      });
    }

    const result = await orchestrate(
      messages
    );

    return NextResponse.json({
      message: result.message,
      citations: result.citations,
      recommendations:
        result.recommendations,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Internal Server Error",
        citations: [],
        recommendations: [],
      },
      {
        status: 500,
      }
    );
  }
}
