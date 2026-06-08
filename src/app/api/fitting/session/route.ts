import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateGuestToken } from "@/lib/utils";
import { checkFittingQuota } from "@/lib/fitting-quota";
import { z } from "zod";

const createSessionSchema = z.object({
  retailerId: z.string().optional(),
  source: z.enum(["direct", "widget", "retailer"]).optional().default("direct"),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json().catch(() => ({}));
    const { retailerId, source } = createSessionSchema.parse(body);

    // Enforce quota for retailer-linked sessions
    if (retailerId) {
      const quota = await checkFittingQuota(retailerId);
      if (!quota.allowed) {
        const message =
          quota.reason === "trial_expired"
            ? "Your free trial has expired. Please upgrade to continue."
            : "You have reached your monthly fitting limit. Please upgrade your plan.";
        return NextResponse.json({ error: message, reason: quota.reason }, { status: 403 });
      }
    }

    const guestToken = generateGuestToken();

    const fittingSession = await db.fittingSession.create({
      data: {
        userId: session?.user?.id,
        retailerId: retailerId ?? null,
        guestToken,
        status: "IN_PROGRESS",
        currentStep: 1,
        source,
      },
    });

    // Track analytics event
    if (retailerId) {
      await db.analyticsEvent.create({
        data: {
          retailerId,
          sessionId: fittingSession.id,
          eventType: "fitting_started",
          eventData: { source },
        },
      });
    }

    return NextResponse.json({
      sessionId: fittingSession.id,
      guestToken: fittingSession.guestToken,
    });
  } catch (error) {
    console.error("Create session error:", error);
    return NextResponse.json({ error: "Failed to create fitting session" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sessions = await db.fittingSession.findMany({
    where: { userId: session.user.id },
    include: {
      playerProfile: true,
      fittingResult: { select: { overallConfidence: true, generatedAt: true, pdfUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return NextResponse.json(sessions);
}
