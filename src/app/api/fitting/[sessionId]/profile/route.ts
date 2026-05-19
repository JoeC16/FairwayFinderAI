import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

interface Params {
  params: Promise<{ sessionId: string }>;
}

const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().optional(),
  age: z.number().int().min(5).max(120).optional(),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]).optional(),
  dominantHand: z.enum(["right", "left"]).default("right"),
  handicap: z.number().min(-10).max(54),
  heightCm: z.number().int().min(100).max(230),
  wristToFloorCm: z.number().int().min(50).max(100).optional(),
  averageScore: z.number().int().min(55).max(200).optional(),
  goals: z.array(z.string()).optional().default([]),
  playingFrequency: z.enum(["rarely", "monthly", "weekly", "multiple_weekly", "daily"]).optional(),
  experience: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const data = profileSchema.parse(body);

    const profile = await db.playerProfile.upsert({
      where: { sessionId },
      create: { sessionId, ...data },
      update: data,
    });

    await db.fittingSession.update({
      where: { id: sessionId },
      data: { currentStep: Math.max(2, 1) },
    });

    return NextResponse.json(profile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("Save profile error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
