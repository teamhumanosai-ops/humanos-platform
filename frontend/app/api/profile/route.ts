import {
  NextResponse,
} from "next/server";

import {
  profileEngine,
} from "@/brain/profile/profileEngine";

import type {
  HumanProfile,
} from "@/brain/profile/types";

export const runtime =
  "nodejs";

function isObject(
  value: unknown
): value is Record<
  string,
  unknown
> {
  return (
    typeof value ===
    "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as unknown;

    if (!isObject(body)) {
      return NextResponse.json(
        {
          error:
            "Invalid profile payload.",
        },
        {
          status: 400,
        }
      );
    }

    const profile =
      profileEngine.create(
        body as Partial<
          HumanProfile
        >
      );

    return NextResponse.json(
      profile,
      {
        status: 200,
      }
    );
  } catch {
    return NextResponse.json(
      {
        error:
          "Unable to save the Human Profile.",
      },
      {
        status: 500,
      }
    );
  }
}
