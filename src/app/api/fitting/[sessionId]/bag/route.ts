import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

interface Params {
  params: Promise<{ sessionId: string }>;
}

const clubSchema = z.object({
  category: z.enum(["driver", "fairway_wood", "hybrid", "driving_iron", "iron_set", "wedge", "putter"]),
  brand: z.string().optional(),
  model: z.string().optional(),
  loft: z.number().optional(),
  shaft: z.string().optional(),
  flex: z.enum(["ladies", "senior", "regular", "stiff", "x_stiff", "tour_x"]).optional(),
  length: z.string().optional(),
  notes: z.string().optional(),
});

const bagSchema = z.object({
  clubs: z.array(clubSchema),
});

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const { sessionId } = await params;
    const body = await req.json();
    const { clubs } = bagSchema.parse(body);

    const bag = await db.currentBag.upsert({
      where: { sessionId },
      create: { sessionId, clubs: clubs as unknown as object },
      update: { clubs: clubs as unknown as object },
    });

    await db.fittingSession.update({
      where: { id: sessionId },
      data: { currentStep: Math.max(3, 2) },
    });

    return NextResponse.json(bag);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to save bag" }, { status: 500 });
  }
}
