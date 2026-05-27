import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { DriverRecommendation, IronRecommendation, WedgeRecommendation } from "@/types/fitting";

interface Params { params: Promise<{ sessionId: string }> }

export interface StockMatch {
  retailerId: string;
  retailerName: string;
  retailerSlug: string;
  items: Array<{
    id: string;
    brand: string;
    model: string;
    category: string;
    loft: string | null;
    flex: string | null;
    price: number;
    salePrice: number | null;
    stockQty: number;
    productUrl: string | null;
    matchType: "driver" | "irons" | "wedge";
  }>;
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { sessionId } = await params;

  const session = await db.fittingSession.findUnique({
    where: { id: sessionId },
    include: { fittingResult: true },
  });

  if (!session?.fittingResult) {
    return NextResponse.json({ matches: [], partners: [] });
  }

  const result = session.fittingResult;
  const driverRec = result.driverRec as DriverRecommendation | null;
  const ironRec = result.ironRec as IronRecommendation | null;
  const wedgeRec = result.wedgeRec as WedgeRecommendation | null;

  // Build search terms
  const searchTerms: Array<{ matchType: "driver" | "irons" | "wedge"; brand: string; model: string }> = [];

  const driverProduct = driverRec?.recommendedProducts?.[0];
  if (driverProduct?.brand && driverProduct?.model) {
    searchTerms.push({ matchType: "driver", brand: driverProduct.brand, model: driverProduct.model.split(" ")[0] });
  }

  const ironProduct = ironRec?.recommendedProducts?.[0];
  if (ironProduct?.brand && ironProduct?.model) {
    searchTerms.push({ matchType: "irons", brand: ironProduct.brand, model: ironProduct.model.split(" ")[0] });
  }

  // For wedges, use the brand from recommended products if available
  const wedgeItems = (wedgeRec as unknown as { wedges?: Array<{ recommendedProducts?: Array<{ brand: string; model: string }> }> })?.wedges;
  const wedgeProduct = wedgeItems?.[0]?.recommendedProducts?.[0];
  if (wedgeProduct?.brand && wedgeProduct?.model) {
    searchTerms.push({ matchType: "wedge", brand: wedgeProduct.brand, model: wedgeProduct.model.split(" ")[0] });
  }

  if (searchTerms.length === 0) {
    const partners = await db.externalPartner.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ matches: [], partners });
  }

  // Query inventory across all active retailers
  const orConditions = searchTerms.map(({ brand, model }) => ({
    AND: [
      { brand: { contains: brand, mode: "insensitive" as const } },
      { model: { contains: model, mode: "insensitive" as const } },
    ],
  }));

  const inventoryItems = await db.retailerInventoryItem.findMany({
    where: {
      available: true,
      stockQty: { gt: 0 },
      retailer: { active: true },
      OR: orConditions,
    },
    include: {
      retailer: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { price: "asc" },
  });

  // Tag each item with its matchType
  const tagged = inventoryItems.map((item) => {
    const match = searchTerms.find(
      (t) =>
        item.brand.toLowerCase().includes(t.brand.toLowerCase()) &&
        item.model.toLowerCase().includes(t.model.toLowerCase())
    );
    return { ...item, matchType: match?.matchType ?? "driver" as "driver" | "irons" | "wedge" };
  });

  // Group by retailer
  const byRetailer = new Map<string, StockMatch>();
  for (const item of tagged) {
    const key = item.retailer.id;
    if (!byRetailer.has(key)) {
      byRetailer.set(key, {
        retailerId: item.retailer.id,
        retailerName: item.retailer.name,
        retailerSlug: item.retailer.slug,
        items: [],
      });
    }
    byRetailer.get(key)!.items.push({
      id: item.id,
      brand: item.brand,
      model: item.model,
      category: item.category,
      loft: item.loft,
      flex: item.flex,
      price: item.price,
      salePrice: item.salePrice,
      stockQty: item.stockQty,
      productUrl: item.productUrl,
      matchType: item.matchType,
    });
  }

  const partners = await db.externalPartner.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({
    matches: Array.from(byRetailer.values()),
    partners,
    searchTerms: searchTerms.map((t) => `${t.brand} ${t.model}`),
  });
}
