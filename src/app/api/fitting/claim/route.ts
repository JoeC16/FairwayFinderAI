import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { sessionId, guestToken } = await req.json() as { sessionId: string; guestToken: string };
  if (!sessionId || !guestToken) {
    return NextResponse.json({ error: "sessionId and guestToken required" }, { status: 400 });
  }

  const fitting = await db.fittingSession.findFirst({
    where: { id: sessionId, guestToken },
  });

  if (!fitting) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (fitting.userId === session.user.id) {
    return NextResponse.json({ claimed: true });
  }

  if (fitting.userId !== null) {
    return NextResponse.json({ error: "Session already claimed" }, { status: 403 });
  }

  await db.fittingSession.update({
    where: { id: sessionId },
    data: { userId: session.user.id },
  });

  return NextResponse.json({ claimed: true });
}
