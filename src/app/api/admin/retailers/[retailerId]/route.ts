import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

interface Params { params: Promise<{ retailerId: string }> }

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { retailerId } = await params;
  const body = await req.json() as Record<string, unknown>;
  const retailer = await db.retailer.update({ where: { id: retailerId }, data: body });
  return NextResponse.json({ retailer });
}
