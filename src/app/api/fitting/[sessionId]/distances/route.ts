import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

interface Params {
  params: Promise<{ sessionId: string }>;
}

const distanceSchema = z.object({
  driver: z.number().positive().optional(),
  threeWood: z.number().positive().optional(),
  fiveWood: z.number().positive().optional(),
  sevenWood: z.number().positive().optional(),
  hybrid: z.number().positive().optional(),
  drivingIron: z.number().positive().optional(),
  fourIron: z.number().positive().optional(),
  fiveIron: z.number().positive().optional(),
  sixIron: z.number().positive().optional(),
  sevenIron: z.number().positive().optional(),
  eightIron: z.number().positive().optional(),
  nineIron: z.number().positive().optional(),
  pitchingWedge: z.number().positive().optional(),
  gapWedge: z.number().positive().optional(),
  sandWedge: z.number().positive().optional(),
  lobWedge: z.number().positive().optional(),
  unit: z.enum(["yards", "meters"]).default("yards"),
});

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const distances = distanceSchema.parse(body);

    const dm = await db.distanceMatrix.upsert({
      where: { sessionId },
      create: { sessionId, distances: distances as unknown as object, unit: distances.unit },
      update: { distances: distances as unknown as object, unit: distances.unit },
    });

    await db.fittingSession.update({
      where: { id: sessionId },
      data: { currentStep: Math.max(5, 4) },
    });

    return NextResponse.json(dm);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save distances" }, { status: 500 });
  }
}
