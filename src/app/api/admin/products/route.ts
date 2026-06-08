import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { ProductCategory } from "@prisma/client";

const productSchema = z.object({
  brand: z.string().min(1),
  model: z.string().min(1),
  category: z.string().min(1),
  year: z.number().nullable().optional(),
  msrp: z.number().nullable().optional(),
  description: z.string().optional(),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as unknown;
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const product = await db.product.create({
    data: {
      brand: parsed.data.brand,
      model: parsed.data.model,
      category: parsed.data.category as ProductCategory,
      year: parsed.data.year ?? null,
      msrp: parsed.data.msrp ?? null,
      description: parsed.data.description ?? null,
      specs: {},
      active: true,
    },
  });

  return NextResponse.json(product, { status: 201 });
}
