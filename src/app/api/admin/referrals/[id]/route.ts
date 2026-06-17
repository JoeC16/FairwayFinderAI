import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json() as { active?: boolean; commissionRate?: number };

  const data: { active?: boolean; commissionRate?: number } = {};
  if (typeof body.active === "boolean") data.active = body.active;
  if (typeof body.commissionRate === "number") data.commissionRate = body.commissionRate;

  const partner = await db.referralPartner.update({ where: { id }, data });
  return NextResponse.json(partner);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  await db.referralPartner.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
