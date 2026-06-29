import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireSessionAccess, getGuestToken } from "@/lib/session-auth";

interface Params {
  params: Promise<{ sessionId: string }>;
}

const tendenciesSchema = z.object({
  typicalMiss: z.enum(["slice", "hook", "push", "pull", "push_fade", "pull_draw", "double_cross", "straight"]).optional(),
  strikePattern: z.enum(["heel", "toe", "thin", "fat", "high_face", "low_face", "center"]).optional(),
  ballFlight: z.enum(["low", "mid", "high"]).optional(),
  shotShape: z.enum(["fade", "draw", "straight"]).optional(),
  frustrations: z.array(z.string()).optional().default([]),
  driverNotes: z.string().optional(),
  ironNotes: z.string().optional(),
  shortGameNotes: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;
    const authSession = await getServerSession(authOptions);
    const guestToken = getGuestToken(req);

    const owned = await requireSessionAccess(sessionId, authSession, guestToken);
    if (!owned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = tendenciesSchema.parse(body);

    const tendencies = await db.shotTendencies.upsert({
      where: { sessionId },
      create: { sessionId, ...data },
      update: data,
    });

    await db.fittingSession.update({
      where: { id: sessionId },
      data: { currentStep: Math.max(4, 3) },
    });

    return NextResponse.json(tendencies);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save tendencies" }, { status: 500 });
  }
}
