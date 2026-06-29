import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireSessionAccess, getGuestToken } from "@/lib/session-auth";

interface Params {
  params: Promise<{ sessionId: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;
    const authSession = await getServerSession(authOptions);
    const guestToken = getGuestToken(req);

    const fittingSession = await db.fittingSession.findUnique({
      where: { id: sessionId },
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

    // Verify caller owns this session (or is admin/retailer)
    const isAdmin = authSession?.user?.role === "ADMIN";
    const isOwner = authSession?.user?.id && fittingSession.userId === authSession.user.id;
    const isRetailerOwner =
      authSession?.user?.role === "RETAILER" && fittingSession.retailerId !== null;
    const isGuest = guestToken && fittingSession.guestToken === guestToken;

    if (!isAdmin && !isOwner && !isRetailerOwner && !isGuest) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Strip full recommendations when results are locked (consumers who haven't paid)
    const unlocked = fittingSession.resultsUnlocked || isRetailerOwner || isAdmin;
    if (!unlocked && fittingSession.fittingResult) {
      return NextResponse.json({
        ...fittingSession,
        fittingResult: {
          ...fittingSession.fittingResult,
          productRecommendations: [],
        },
      });
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
    const authSession = await getServerSession(authOptions);
    const guestToken = getGuestToken(req);

    const owned = await requireSessionAccess(sessionId, authSession, guestToken);
    if (!owned) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json() as { currentStep?: number; status?: string; metadata?: unknown };

    const updated = await db.fittingSession.update({
      where: { id: sessionId },
      data: {
        currentStep: body.currentStep,
        status: body.status as Parameters<typeof db.fittingSession.update>[0]["data"]["status"],
        metadata: body.metadata as Parameters<typeof db.fittingSession.update>[0]["data"]["metadata"],
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update session error:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
