import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { addMonths, max } from "date-fns";

interface Params {
  params: Promise<{ userId: string }>;
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;
  const body = await req.json() as { months?: number };
  const months = typeof body.months === "number" ? body.months : 12;

  const sub = await db.subscription.findUnique({ where: { userId } });
  const base = sub?.promoterUntil && sub.promoterUntil > new Date()
    ? sub.promoterUntil
    : new Date();

  const promoterUntil = addMonths(max([base, new Date()]), months);

  await db.subscription.upsert({
    where: { userId },
    update: { promoterUntil },
    create: { userId, plan: "promoter", status: "active", promoterUntil },
  });

  return NextResponse.json({ promoterUntil });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId } = await params;

  await db.subscription.update({
    where: { userId },
    data: { promoterUntil: null },
  });

  return NextResponse.json({ ok: true });
}
