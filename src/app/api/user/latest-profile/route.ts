import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json(null, { status: 401 });

  const profile = await db.playerProfile.findFirst({
    where: { session: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
    select: {
      name: true,
      email: true,
      phone: true,
      age: true,
      gender: true,
      dominantHand: true,
      handicap: true,
      heightCm: true,
      wristToFloorCm: true,
      averageScore: true,
      playingFrequency: true,
      goals: true,
    },
  });

  return NextResponse.json(profile);
}
