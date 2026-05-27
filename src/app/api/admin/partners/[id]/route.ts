import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

interface Params { params: Promise<{ id: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const body = await req.json() as Record<string, unknown>;
  const partner = await db.externalPartner.update({ where: { id }, data: body });
  return NextResponse.json({ partner });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  await db.externalPartner.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
