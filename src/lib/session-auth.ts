import { db } from "@/lib/db";
import type { Session } from "next-auth";
import { NextRequest } from "next/server";

export function getGuestToken(req: NextRequest): string | null {
  return (
    req.nextUrl.searchParams.get("token") ??
    req.headers.get("x-guest-token") ??
    null
  );
}

export async function requireSessionAccess(
  sessionId: string,
  authSession: Session | null,
  guestToken: string | null
) {
  if (authSession?.user?.role === "ADMIN") {
    return db.fittingSession.findUnique({ where: { id: sessionId } });
  }

  const conditions: Parameters<typeof db.fittingSession.findFirst>[0]["where"][] = [];

  if (authSession?.user?.id) {
    conditions.push({ userId: authSession.user.id });
    // RETAILER role can access sessions belonging to their retailer shop
    if (authSession.user.role === "RETAILER") {
      conditions.push({ retailer: { userId: authSession.user.id } });
    }
  }
  if (guestToken) conditions.push({ guestToken });

  if (conditions.length === 0) return null;

  return db.fittingSession.findFirst({
    where: { id: sessionId, OR: conditions },
  });
}
