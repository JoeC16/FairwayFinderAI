import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const createRetailerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createRetailerSchema.parse(body);

    // Check for existing retailer account
    const existing = await db.retailer.findUnique({
      where: { userId: session.user.id },
    });

    if (existing) {
      return NextResponse.json({ error: "Retailer account already exists" }, { status: 409 });
    }

    // Generate unique slug
    let slug = slugify(data.name);
    const slugExists = await db.retailer.findUnique({ where: { slug } });
    if (slugExists) slug = `${slug}-${Date.now().toString(36)}`;

    const retailer = await db.retailer.create({
      data: {
        userId: session.user.id,
        name: data.name,
        slug,
        email: data.email,
        phone: data.phone,
        website: data.website,
        primaryColor: data.primaryColor ?? "#166534",
        plan: "STARTER",
        active: true,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    });

    // Update user role to RETAILER
    await db.user.update({
      where: { id: session.user.id },
      data: { role: "RETAILER" },
    });

    // Create default widget config
    await db.widgetConfig.create({
      data: {
        retailerId: retailer.id,
        collectLeads: true,
        requireEmail: true,
        showBranding: true,
        showLogo: true,
      },
    });

    return NextResponse.json(retailer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("Create retailer error:", error);
    return NextResponse.json({ error: "Failed to create retailer" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Admin can see all retailers
  if (session.user.role === "ADMIN") {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");

    const retailers = await db.retailer.findMany({
      include: {
        user: { select: { email: true, name: true } },
        subscription: true,
        _count: { select: { fittingSessions: true, leads: true, inventory: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(retailers);
  }

  // Retailer sees their own account
  const retailer = await db.retailer.findUnique({
    where: { userId: session.user.id },
    include: {
      widgetConfig: true,
      subscription: true,
      _count: { select: { fittingSessions: true, leads: true, inventory: true } },
    },
  });

  return NextResponse.json(retailer);
}
