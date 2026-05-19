import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Prisma, ProductCategory } from "@prisma/client";
import { z } from "zod";
import Papa from "papaparse";

interface Params {
  params: Promise<{ retailerId: string }>;
}

const inventoryItemSchema = z.object({
  sku: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  category: z.nativeEnum(ProductCategory),
  loft: z.string().optional(),
  shaft: z.string().optional(),
  flex: z.string().optional(),
  handedness: z.string().optional(),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  stockQty: z.number().int().min(0).default(0),
  productUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  available: z.boolean().default(true),
  specs: z.record(z.unknown()).optional(),
});

async function verifyRetailerAccess(userId: string, retailerId: string): Promise<boolean> {
  const retailer = await db.retailer.findFirst({
    where: { id: retailerId, userId },
  });
  return !!retailer;
}

export async function GET(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { retailerId } = await params;
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") as ProductCategory | null;
    const available = searchParams.get("available");
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "50");

    const where: Prisma.RetailerInventoryItemWhereInput = { retailerId };
    if (category) where.category = category;
    if (available !== null) where.available = available === "true";

    const [inventory, total] = await Promise.all([
      db.retailerInventoryItem.findMany({
        where,
        orderBy: [{ category: "asc" }, { brand: "asc" }, { model: "asc" }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.retailerInventoryItem.count({ where: { retailerId } }),
    ]);

    return NextResponse.json({ inventory, total, page, limit });
  } catch (error) {
    console.error("Get inventory error:", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { retailerId } = await params;
    const hasAccess = await verifyRetailerAccess(session.user.id, retailerId);
    if (!hasAccess && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const contentType = req.headers.get("content-type") ?? "";

    // Handle CSV upload
    if (contentType.includes("text/csv") || contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File;
      if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

      const text = await file.text();
      const { data } = Papa.parse(text, { header: true, skipEmptyLines: true });

      const results = { created: 0, updated: 0, errors: [] as string[], items: [] as object[] };

      for (const row of data as Record<string, string>[]) {
        try {
          const raw = {
            sku: row.sku ?? row.SKU,
            brand: row.brand ?? row.Brand,
            model: row.model ?? row.Model,
            category: (row.category ?? row.Category ?? "").toUpperCase() as ProductCategory,
            loft: (row.loft ?? row.Loft) || undefined,
            shaft: (row.shaft ?? row.Shaft) || undefined,
            flex: (row.flex ?? row.Flex) || undefined,
            price: parseFloat(row.price ?? row.Price ?? "0"),
            salePrice: row.sale_price ? parseFloat(row.sale_price) : undefined,
            stockQty: parseInt(row.stock_qty ?? row.StockQty ?? "0"),
            productUrl: (row.product_url ?? row.ProductUrl) || undefined,
            imageUrl: (row.image_url ?? row.ImageUrl) || undefined,
            available: row.available !== "false",
          };

          const validated = inventoryItemSchema.parse(raw);
          const { specs, ...rest } = validated;

          const item = await db.retailerInventoryItem.upsert({
            where: { retailerId_sku: { retailerId, sku: validated.sku } },
            create: {
              retailerId,
              ...rest,
              ...(specs ? { specs: specs as Prisma.InputJsonValue } : {}),
            },
            update: {
              ...rest,
              ...(specs ? { specs: specs as Prisma.InputJsonValue } : {}),
            },
          });

          results.items.push(item);
          results.created++;
        } catch (err) {
          results.errors.push(`Row error: ${(err as Error).message}`);
        }
      }

      return NextResponse.json(results);
    }

    // Handle single item POST
    const body = await req.json() as unknown;
    const validated = inventoryItemSchema.parse(body);
    const { specs, ...rest } = validated;

    const item = await db.retailerInventoryItem.upsert({
      where: { retailerId_sku: { retailerId, sku: validated.sku } },
      create: {
        retailerId,
        ...rest,
        ...(specs ? { specs: specs as Prisma.InputJsonValue } : {}),
      },
      update: {
        ...rest,
        ...(specs ? { specs: specs as Prisma.InputJsonValue } : {}),
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: error.issues }, { status: 400 });
    }
    console.error("Save inventory error:", error);
    return NextResponse.json({ error: "Failed to save inventory" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { retailerId } = await params;
    const hasAccess = await verifyRetailerAccess(session.user.id, retailerId);
    if (!hasAccess && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { ids } = await req.json() as { ids: string[] };
    await db.retailerInventoryItem.deleteMany({
      where: { id: { in: ids }, retailerId },
    });

    return NextResponse.json({ deleted: ids.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete items" }, { status: 500 });
  }
}
