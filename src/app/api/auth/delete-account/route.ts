import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Cascade deletes are handled by Prisma schema relations (onDelete: Cascade)
  await db.user.delete({ where: { id: session.user.id } });

  return NextResponse.json({ success: true });
}
