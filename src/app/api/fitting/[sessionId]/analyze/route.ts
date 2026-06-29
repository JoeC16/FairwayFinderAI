import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { runFittingEngine } from "@/lib/engines/fitting-engine";
import { matchInventory } from "@/lib/engines/inventory-matching-engine";
import { incrementFittingsUsed } from "@/lib/fitting-quota";
import { sendEmail } from "@/lib/email";
import { fittingCompleteEmail } from "@/lib/email/templates";
import type { FittingEngineInput, DistanceMatrixInput, CurrentBagInput, ShotTendenciesInput, LaunchMonitorInput } from "@/types/fitting";

interface Params {
  params: Promise<{ sessionId: string }>;
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;

    // Load all session data
    const session = await db.fittingSession.findUnique({
      where: { id: sessionId },
      include: {
        playerProfile: true,
        currentBag: true,
        shotTendencies: true,
        distanceMatrix: true,
        launchMonitor: true,
        swingVideos: true,
        retailer: {
          include: { inventory: { where: { available: true, stockQty: { gt: 0 } } } },
        },
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Idempotency: prevent double-processing
    if (session.status === "PROCESSING") {
      return NextResponse.json({ error: "Analysis already in progress" }, { status: 409 });
    }

    if (!session.playerProfile) {
      return NextResponse.json({ error: "Player profile required to run analysis" }, { status: 400 });
    }

    const alreadyCompleted = session.status === "COMPLETED";

    // Update status to processing
    await db.fittingSession.update({
      where: { id: sessionId },
      data: { status: "PROCESSING" },
    });

    // Build engine input
    const input: FittingEngineInput = {
      sessionId,
      retailerId: session.retailerId ?? undefined,
      profile: {
        name: session.playerProfile.name,
        email: session.playerProfile.email,
        phone: session.playerProfile.phone ?? undefined,
        age: session.playerProfile.age ?? undefined,
        gender: (session.playerProfile.gender as FittingEngineInput["profile"]["gender"]) ?? undefined,
        dominantHand: session.playerProfile.dominantHand as "right" | "left",
        handicap: session.playerProfile.handicap,
        heightCm: session.playerProfile.heightCm,
        wristToFloorCm: session.playerProfile.wristToFloorCm ?? undefined,
        averageScore: session.playerProfile.averageScore ?? undefined,
        goals: session.playerProfile.goals,
        playingFrequency: session.playerProfile.playingFrequency as FittingEngineInput["profile"]["playingFrequency"] ?? undefined,
      },
      currentBag: session.currentBag
        ? (session.currentBag.clubs as unknown as CurrentBagInput)
        : undefined,
      tendencies: session.shotTendencies
        ? {
            typicalMiss: session.shotTendencies.typicalMiss as ShotTendenciesInput["typicalMiss"] ?? undefined,
            strikePattern: session.shotTendencies.strikePattern as ShotTendenciesInput["strikePattern"] ?? undefined,
            ballFlight: session.shotTendencies.ballFlight as ShotTendenciesInput["ballFlight"] ?? undefined,
            shotShape: session.shotTendencies.shotShape as ShotTendenciesInput["shotShape"] ?? undefined,
            frustrations: session.shotTendencies.frustrations,
            driverNotes: session.shotTendencies.driverNotes ?? undefined,
            ironNotes: session.shotTendencies.ironNotes ?? undefined,
            shortGameNotes: session.shotTendencies.shortGameNotes ?? undefined,
          }
        : undefined,
      distanceMatrix: session.distanceMatrix
        ? (session.distanceMatrix.distances as unknown as DistanceMatrixInput)
        : undefined,
      launchMonitor: session.launchMonitor
        ? {
            monitorType: session.launchMonitor.monitorType as LaunchMonitorInput["monitorType"] ?? undefined,
            driverData: session.launchMonitor.driverData as LaunchMonitorInput["driverData"] ?? undefined,
            ironData: session.launchMonitor.ironData as LaunchMonitorInput["ironData"] ?? undefined,
          }
        : undefined,
      swingVideoCount: session.swingVideos.length,
    };

    // Run fitting engine
    let result = await runFittingEngine(input);

    // Match against retailer inventory if available
    if (session.retailer?.inventory?.length) {
      result = matchInventory(session.retailer.inventory as Parameters<typeof matchInventory>[0], result);
    }

    // Store result in database
    const storedResult = await db.fittingResult.upsert({
      where: { sessionId },
      create: {
        sessionId,
        overallConfidence: result.confidence.overall.score,
        confidenceScores: result.confidence as unknown as Prisma.InputJsonValue,
        driverRec: result.driver as unknown as Prisma.InputJsonValue,
        ironRec: result.irons as unknown as Prisma.InputJsonValue,
        wedgeRec: result.wedges as unknown as Prisma.InputJsonValue,
        shaftRec: result.shafts as unknown as Prisma.InputJsonValue,
        lieLengthRec: result.lieLength as unknown as Prisma.InputJsonValue,
        bagGapAnalysis: result.bagGaps as unknown as Prisma.InputJsonValue,
        upgradeOrder: result.upgradePriorities as unknown as Prisma.InputJsonValue,
        aiSummary: result.summaryPoints.join(" "),
      },
      update: {
        overallConfidence: result.confidence.overall.score,
        confidenceScores: result.confidence as unknown as Prisma.InputJsonValue,
        driverRec: result.driver as unknown as Prisma.InputJsonValue,
        ironRec: result.irons as unknown as Prisma.InputJsonValue,
        wedgeRec: result.wedges as unknown as Prisma.InputJsonValue,
        shaftRec: result.shafts as unknown as Prisma.InputJsonValue,
        lieLengthRec: result.lieLength as unknown as Prisma.InputJsonValue,
        bagGapAnalysis: result.bagGaps as unknown as Prisma.InputJsonValue,
        upgradeOrder: result.upgradePriorities as unknown as Prisma.InputJsonValue,
        aiSummary: result.summaryPoints.join(" "),
        updatedAt: new Date(),
      },
    });

    // Create lead for retailer sessions
    if (session.retailerId && session.playerProfile) {
      await db.lead.upsert({
        where: { sessionId: session.id },
        create: {
          retailerId: session.retailerId,
          sessionId: session.id,
          name: session.playerProfile.name,
          email: session.playerProfile.email,
          phone: session.playerProfile.phone ?? undefined,
          handicap: session.playerProfile.handicap,
          interests: session.playerProfile.goals,
          source: session.source ?? "widget",
          status: "NEW",
        },
        update: { status: "NEW" },
      });
    }

    // Determine if results should be unlocked
    const isRetailerFitting = !!session.retailerId;
    let hasCredit = false;
    let isPromoter = false;
    let isAdmin = false;

    // Check the caller's role first — covers guest fittings where session.userId is null
    const authSession = await getServerSession(authOptions);
    if (authSession?.user?.role === "ADMIN") {
      isAdmin = true;
    }

    if (!isRetailerFitting && session.userId) {
      const sub = await db.subscription.findUnique({ where: { userId: session.userId } });
      isPromoter = sub?.promoterUntil ? sub.promoterUntil > new Date() : false;
      hasCredit = (sub?.fittingCredits ?? 0) > 0;
      // Also check DB role in case the session owner is an admin with no JWT (e.g. server-to-server)
      if (!isAdmin) {
        const user = await db.user.findUnique({ where: { id: session.userId }, select: { role: true } });
        isAdmin = user?.role === "ADMIN";
      }
    }
    const resultsUnlocked = isRetailerFitting || isPromoter || hasCredit || isAdmin;

    // Mark session complete + set unlock flag
    await db.fittingSession.update({
      where: { id: sessionId },
      data: { status: "COMPLETED", completedAt: new Date(), resultsUnlocked },
    });

    // Only decrement credits on first analysis to prevent double-charge on retry
    if (hasCredit && !isPromoter && !isAdmin && session.userId && !alreadyCompleted) {
      await db.subscription.update({
        where: { userId: session.userId },
        data: { fittingCredits: { decrement: 1 } },
      });
    }

    // Increment retailer fitting usage + send report email
    if (session.retailerId) {
      await incrementFittingsUsed(session.retailerId);
    }
    if (session.playerProfile?.email) {
      await sendEmail({
        to: session.playerProfile.email,
        subject: "Your FairwayFit AI report is ready",
        html: fittingCompleteEmail(session.playerProfile.name, sessionId),
      });
    }

    return NextResponse.json({
      resultId: storedResult.id,
      sessionId,
      overallConfidence: result.confidence.overall.score,
      resultsUnlocked,
      result,
    });
  } catch (error) {
    console.error("Analyze session error:", error);

    // Reset status on failure
    const { sessionId } = await params;
    await db.fittingSession.update({
      where: { id: sessionId },
      data: { status: "IN_PROGRESS" },
    }).catch(() => {});

    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
