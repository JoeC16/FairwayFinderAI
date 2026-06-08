import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const schema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(100),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  const user = await db.user.findUnique({ where: { id: session.user.id } });
  if (!user?.password) return NextResponse.json({ error: "No password set on this account" }, { status: 400 });

  const valid = await bcrypt.compare(parsed.data.currentPassword, user.password);
  if (!valid) return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });

  const hash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.user.update({ where: { id: user.id }, data: { password: hash } });

  return NextResponse.json({ success: true });
}
