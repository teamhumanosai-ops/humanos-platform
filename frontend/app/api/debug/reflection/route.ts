import { NextResponse } from "next/server";

import { runReflectionEngine } from "@/brain/reflection";

export async function GET() {
  try {
    const started = Date.now();

    await runReflectionEngine();

    const elapsed = Date.now() - started;

    return NextResponse.json({
      success: true,
      engine: "Reflection Engine",
      duration: `${elapsed} ms`,
      message: "Reflection engine executed successfully.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}