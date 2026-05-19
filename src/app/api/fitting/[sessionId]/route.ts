import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ sessionId: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;
    const session = await getServerSession(authOptions);
    const guestToken = req.nextUrl.searchParams.get("token");

    const fittingSession = await db.fittingSession.findFirst({
      where: {
        id: sessionId,
        OR: [
          { userId: session?.user?.id ?? undefined },
          { guestToken: guestToken ?? undefined },
          // Allow anonymous access for in-progress sessions with valid ID
        ],
      },
      include: {
        playerProfile: true,
        currentBag: true,
        shotTendencies: true,
        distanceMatrix: true,
        launchMonitor: true,
        swingVideos: true,
        fittingResult: {
          include: {
            productRecommendations: {
              include: {
                product: true,
                matches: { include: { inventoryItem: true } },
              },
            },
          },
        },
      },
    });

    if (!fittingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json(fittingSession);
  } catch (error) {
    console.error("Get session error:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;
    const body = await req.json();

    const updated = await db.fittingSession.update({
      where: { id: sessionId },
      data: {
        currentStep: body.currentStep,
        status: body.status,
        metadata: body.metadata,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
