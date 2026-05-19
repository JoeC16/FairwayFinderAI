import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  primaryColor: z.string().optional(),
  welcomeTitle: z.string().nullable().optional(),
  welcomeText: z.string().nullable().optional(),
  ctaText: z.string().nullable().optional(),
  allowedDomains: z.array(z.string()).optional(),
  collectLeads: z.boolean().optional(),
  requireEmail: z.boolean().optional(),
  showBranding: z.boolean().optional(),
  redirectUrl: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ retailerId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { retailerId } = await params;

  const retailer = await db.retailer.findUnique({ where: { id: retailerId } });
  if (!retailer || (retailer.userId !== session.user.id && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as unknown;
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
  }

  const config = await db.widgetConfig.upsert({
    where: { retailerId },
    update: parsed.data,
    create: { retailerId, ...parsed.data },
  });

  return NextResponse.json(config);
}
