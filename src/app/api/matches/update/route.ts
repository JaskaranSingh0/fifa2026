import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const UpdateMatchSchema = z.object({
  matchId: z.string(),
  homeScore: z.number().int(),
  awayScore: z.number().int(),
  minute: z.number().int(),
  status: z.enum(["SCHEDULED", "LIVE", "FINISHED"]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = UpdateMatchSchema.parse(body);

    const match = await prisma.match.update({
      where: { id: parsed.matchId },
      data: {
        homeScore: parsed.homeScore,
        awayScore: parsed.awayScore,
        minute: parsed.minute,
        status: parsed.status,
      },
    });

    return NextResponse.json({ success: true, match });
  } catch (error) {
    console.error("Match update error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Invalid request" },
      { status: 400 }
    );
  }
}
