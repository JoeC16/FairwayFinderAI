import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const partners = await db.externalPartner.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ partners });
}

export async function POST(req: NextRequest) {
  if (!await requireAdmin()) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json() as {
    name: string; slug: string; description?: string; tagline?: string;
    website: string; searchUrlTemplate?: string; accentColor?: string;
    bgColor?: string; initials?: string; countries?: string[]; sortOrder?: number;
  };

  if (!body.name || !body.slug || !body.website) {
    return NextResponse.json({ error: "name, slug and website are required" }, { status: 400 });
  }

  const partner = await db.externalPartner.create({ data: body });
  return NextResponse.json({ partner }, { status: 201 });
}
