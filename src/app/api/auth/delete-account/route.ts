import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, password: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.password) {
    const body = await req.json().catch(() => ({})) as { password?: string };
    if (!body.password) {
      return NextResponse.json({ error: "Password required to delete account" }, { status: 400 });
    }
    const valid = await bcrypt.compare(body.password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 403 });
    }
  }

  // Cascade deletes are handled by Prisma schema relations (onDelete: Cascade)
  await db.user.delete({ where: { id: user.id } });

  return NextResponse.json({ success: true });
}
