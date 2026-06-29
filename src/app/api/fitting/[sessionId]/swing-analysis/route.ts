import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { analyseSwing } from "@/lib/ai/swing-analyser";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { requireSessionAccess, getGuestToken } from "@/lib/session-auth";

export const runtime = "nodejs";

interface Params {
  params: Promise<{ sessionId: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;
    const authSession = await getServerSession(authOptions);
    const guestToken = getGuestToken(req);

    const owned = await requireSessionAccess(sessionId, authSession, guestToken);
    if (!owned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { images } = await req.json() as { images: string[] };

    if (!images?.length) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    const analysis = await analyseSwing(images.slice(0, 4));

    await db.fittingSession.update({
      where: { id: sessionId },
      data: { swingAnalysis: analysis as unknown as Prisma.InputJsonValue },
    });

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Swing analysis error:", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
