import { NextRequest, NextResponse } from "next/server";
import { analyseSwing } from "@/lib/ai/swing-analyser";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { images } = await req.json() as { images: string[] };

    if (!images?.length) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    if (images.length > 4) {
      return NextResponse.json({ error: "Maximum 4 images" }, { status: 400 });
    }

    const analysis = await analyseSwing(images);
    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Swing analysis error:", err);
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
