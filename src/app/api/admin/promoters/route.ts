import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { addMonths } from "date-fns";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const promoters = await db.subscription.findMany({
    where: { promoterUntil: { not: null } },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { promoterUntil: "desc" },
  });

  return NextResponse.json(promoters);
}

const createSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  months: z.number().int().min(1).max(120).default(12),
});

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as unknown;
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, password, months } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const promoterUntil = addMonths(new Date(), months);

  const user = await db.user.create({
    data: {
      name,
      email,
      password: passwordHash,
      role: "CONSUMER",
      subscription: {
        create: {
          plan: "promoter",
          status: "active",
          promoterUntil,
        },
      },
    },
    select: { id: true, email: true },
  });

  return NextResponse.json({ userId: user.id, email: user.email, promoterUntil }, { status: 201 });
}
