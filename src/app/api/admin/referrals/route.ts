import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const partners = await db.referralPartner.findMany({
    include: { conversions: true },
    orderBy: { createdAt: "desc" },
  });

  const result = partners.map((p) => {
    const signups = p.conversions.filter((c) => c.type === "signup").length;
    const payments = p.conversions.filter((c) => c.type === "payment");
    const totalAmountPence = payments.reduce((sum, c) => sum + (c.amountPence ?? 0), 0);
    const totalCommissionPence = payments.reduce((sum, c) => sum + (c.commissionPence ?? 0), 0);

    return {
      id: p.id,
      code: p.code,
      name: p.name,
      email: p.email,
      commissionRate: p.commissionRate,
      active: p.active,
      createdAt: p.createdAt,
      signups,
      payments: payments.length,
      totalAmountPence,
      totalCommissionPence,
    };
  });

  return NextResponse.json(result);
}

const createSchema = z.object({
  code: z.string().min(2).max(40).regex(/^[a-zA-Z0-9_-]+$/, "Code may only contain letters, numbers, - and _"),
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal("")),
  commissionRate: z.number().min(0).max(1).default(0.2),
});

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as unknown;
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { code, name, email, commissionRate } = parsed.data;

  const existing = await db.referralPartner.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: "A partner with this code already exists" }, { status: 409 });
  }

  const partner = await db.referralPartner.create({
    data: { code, name, email: email || undefined, commissionRate },
  });

  return NextResponse.json(partner, { status: 201 });
}
