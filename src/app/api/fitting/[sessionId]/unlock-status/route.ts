import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ sessionId: string }>;
}

export async function GET(req: NextRequest, { params }: Params) {
  const { sessionId } = await params;
  const authSession = await getServerSession(authOptions);
  const guestToken = req.nextUrl.searchParams.get("token");

  const fitting = await db.fittingSession.findFirst({
    where: {
      id: sessionId,
      OR: [
        { userId: authSession?.user?.id ?? "__none__" },
        { guestToken: guestToken ?? "__none__" },
        { retailerId: { not: null } },
      ],
    },
    select: { resultsUnlocked: true, retailerId: true },
  });

  if (!fitting) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ unlocked: fitting.resultsUnlocked || !!fitting.retailerId });
}
