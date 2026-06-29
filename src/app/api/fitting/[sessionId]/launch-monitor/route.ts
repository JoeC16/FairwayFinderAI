import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { requireSessionAccess, getGuestToken } from "@/lib/session-auth";

interface Params {
  params: Promise<{ sessionId: string }>;
}

const driverDataSchema = z.object({
  clubSpeed: z.number().positive().optional(),
  ballSpeed: z.number().positive().optional(),
  smashFactor: z.number().positive().optional(),
  launchAngle: z.number().optional(),
  spinRate: z.number().positive().optional(),
  carryDistance: z.number().positive().optional(),
  totalDistance: z.number().positive().optional(),
  attackAngle: z.number().optional(),
  clubPath: z.number().optional(),
  faceAngle: z.number().optional(),
  dynamicLoft: z.number().optional(),
  apex: z.number().positive().optional(),
  descentAngle: z.number().optional(),
  spinAxis: z.number().optional(),
});

const ironDataSchema = z.object({
  club: z.string().optional(),
  clubSpeed: z.number().positive().optional(),
  ballSpeed: z.number().positive().optional(),
  launchAngle: z.number().optional(),
  spinRate: z.number().positive().optional(),
  carryDistance: z.number().positive().optional(),
  peakHeight: z.number().positive().optional(),
  descentAngle: z.number().optional(),
  landingAngle: z.number().optional(),
});

const launchMonitorSchema = z.object({
  monitorType: z.enum(["trackman", "gcquad", "flightscope", "skytrak", "uneekor", "other"]).optional(),
  driverData: driverDataSchema.optional(),
  ironData: ironDataSchema.optional(),
  wedgeData: ironDataSchema.optional(),
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
    const data = launchMonitorSchema.parse(body);

    const lm = await db.launchMonitorData.upsert({
      where: { sessionId },
      create: {
        sessionId,
        monitorType: data.monitorType ?? null,
        driverData: data.driverData as unknown as object ?? null,
        ironData: data.ironData as unknown as object ?? null,
        wedgeData: data.wedgeData as unknown as object ?? null,
      },
      update: {
        monitorType: data.monitorType ?? null,
        driverData: data.driverData as unknown as object ?? null,
        ironData: data.ironData as unknown as object ?? null,
        wedgeData: data.wedgeData as unknown as object ?? null,
      },
    });

    await db.fittingSession.update({
      where: { id: sessionId },
      data: { currentStep: Math.max(6, 5) },
    });

    return NextResponse.json(lm);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save launch monitor data" }, { status: 500 });
  }
}
