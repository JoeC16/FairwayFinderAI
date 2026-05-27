import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { scrapePartner, scoreMatch } from "@/lib/scrapers/scrape-partner";
import type { ScrapedProduct } from "@/lib/scrapers/scrape-partner";
import type { DriverRecommendation, IronRecommendation } from "@/types/fitting";
import { Prisma } from "@prisma/client";

export const runtime = "nodejs";

const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

interface Params { params: Promise<{ sessionId: string }> }

// ─────────────────────────────────────────────────────────────────────────────
// Types surfaced to the client
// ─────────────────────────────────────────────────────────────────────────────

export interface StockMatch {
  retailerId: string;
  retailerName: string;
  retailerSlug: string;
  items: Array<{
    id: string; brand: string; model: string; category: string;
    loft: string | null; flex: string | null; price: number;
    salePrice: number | null; stockQty: number; productUrl: string | null;
    matchType: "driver" | "irons" | "wedge";
  }>;
}

export interface PartnerResult {
  partner: {
    id: string; name: string; description: string | null; tagline: string | null;
    website: string; searchUrlTemplate: string | null;
    accentColor: string; bgColor: string; initials: string | null;
    scraperEnabled: boolean;
  };
  products: ScrapedProduct[];
  fromCache: boolean;
  scraped: boolean; // false = no scraper configured, show link only
}

// ─────────────────────────────────────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: Params) {
  const { sessionId } = await params;

  const session = await db.fittingSession.findUnique({
    where: { id: sessionId },
    include: { fittingResult: true },
  });

  if (!session?.fittingResult) {
    const partners = await db.externalPartner.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ matches: [], partnerResults: buildFallbackPartnerResults(partners), searchTerms: [] });
  }

  const result = session.fittingResult;
  const driverRec = result.driverRec as DriverRecommendation | null;
  const ironRec = result.ironRec as IronRecommendation | null;

  // Build search terms from top recommended products
  type MatchTerm = { matchType: "driver" | "irons" | "wedge"; brand: string; model: string };
  const searchTerms: MatchTerm[] = [];

  const dp = driverRec?.recommendedProducts?.[0];
  if (dp?.brand && dp?.model) searchTerms.push({ matchType: "driver", brand: dp.brand, model: dp.model.split(" ")[0] });

  const ip = ironRec?.recommendedProducts?.[0];
  if (ip?.brand && ip?.model) searchTerms.push({ matchType: "irons", brand: ip.brand, model: ip.model.split(" ")[0] });

  // ── Platform retailer inventory cross-ref ───────────────────────────────
  const matches: StockMatch[] = [];

  if (searchTerms.length > 0) {
    const orConditions = searchTerms.map(({ brand, model }) => ({
      AND: [
        { brand: { contains: brand, mode: "insensitive" as const } },
        { model: { contains: model, mode: "insensitive" as const } },
      ],
    }));

    const inventoryItems = await db.retailerInventoryItem.findMany({
      where: {
        available: true, stockQty: { gt: 0 },
        retailer: { active: true },
        OR: orConditions,
      },
      include: { retailer: { select: { id: true, name: true, slug: true } } },
      orderBy: { price: "asc" },
    });

    const tagged = inventoryItems.map((item) => {
      const match = searchTerms.find(
        (t) =>
          item.brand.toLowerCase().includes(t.brand.toLowerCase()) &&
          item.model.toLowerCase().includes(t.model.toLowerCase())
      );
      return { ...item, matchType: (match?.matchType ?? "driver") as "driver" | "irons" | "wedge" };
    });

    const byRetailer = new Map<string, StockMatch>();
    for (const item of tagged) {
      const key = item.retailer.id;
      if (!byRetailer.has(key)) {
        byRetailer.set(key, { retailerId: item.retailer.id, retailerName: item.retailer.name, retailerSlug: item.retailer.slug, items: [] });
      }
      byRetailer.get(key)!.items.push({
        id: item.id, brand: item.brand, model: item.model, category: item.category,
        loft: item.loft, flex: item.flex, price: item.price, salePrice: item.salePrice,
        stockQty: item.stockQty, productUrl: item.productUrl, matchType: item.matchType,
      });
    }
    matches.push(...byRetailer.values());
  }

  // ── External partner scraping ────────────────────────────────────────────
  const partners = await db.externalPartner.findMany({
    where: { active: true },
    orderBy: { sortOrder: "asc" },
  });

  // Scrape query = "Brand Model" of the top recommendation
  const scrapeQuery = searchTerms.map((t) => `${t.brand} ${t.model}`).join(" ").trim();

  const partnerResults: PartnerResult[] = await Promise.all(
    partners.map((partner) => resolvePartner(partner, scrapeQuery))
  );

  return NextResponse.json({
    matches,
    partnerResults,
    searchTerms: searchTerms.map((t) => `${t.brand} ${t.model}`),
  });
}

// ─────────────────────────────────────────────────────────────────────────────

async function resolvePartner(
  partner: {
    id: string; name: string; description: string | null; tagline: string | null;
    website: string; searchUrlTemplate: string | null; accentColor: string;
    bgColor: string; initials: string | null; scraperEnabled: boolean;
    scraperType: string | null; scraperConfig: unknown;
  },
  query: string
): Promise<PartnerResult> {
  const base = {
    partner: {
      id: partner.id, name: partner.name, description: partner.description,
      tagline: partner.tagline, website: partner.website,
      searchUrlTemplate: partner.searchUrlTemplate, accentColor: partner.accentColor,
      bgColor: partner.bgColor, initials: partner.initials,
      scraperEnabled: partner.scraperEnabled,
    },
  };

  if (!partner.scraperEnabled || !partner.scraperType || !query) {
    return { ...base, products: [], fromCache: false, scraped: false };
  }

  // Check cache
  const cached = await db.scrapeCache.findUnique({
    where: { partnerId_query: { partnerId: partner.id, query } },
  });

  if (cached && new Date() < cached.expiresAt) {
    return {
      ...base,
      products: cached.results as unknown as ScrapedProduct[],
      fromCache: true,
      scraped: true,
    };
  }

  // Scrape live
  const products = await scrapePartner(
    { id: partner.id, website: partner.website, searchUrlTemplate: partner.searchUrlTemplate, scraperType: partner.scraperType },
    query
  );

  // Re-score against the full query (scrapeShopify may not have set score)
  const scored = products.map((p) => ({ ...p, matchScore: scoreMatch(p.name, query) }));

  // Persist cache
  await db.scrapeCache.upsert({
    where: { partnerId_query: { partnerId: partner.id, query } },
    update: { results: scored as unknown as Prisma.InputJsonValue, expiresAt: new Date(Date.now() + CACHE_TTL_MS) },
    create: { partnerId: partner.id, query, results: scored as unknown as Prisma.InputJsonValue, expiresAt: new Date(Date.now() + CACHE_TTL_MS) },
  });

  return { ...base, products: scored, fromCache: false, scraped: true };
}

function buildFallbackPartnerResults(partners: Array<{
  id: string; name: string; description: string | null; tagline: string | null;
  website: string; searchUrlTemplate: string | null; accentColor: string;
  bgColor: string; initials: string | null; scraperEnabled: boolean;
}>): PartnerResult[] {
  return partners.map((p) => ({
    partner: {
      id: p.id, name: p.name, description: p.description, tagline: p.tagline,
      website: p.website, searchUrlTemplate: p.searchUrlTemplate, accentColor: p.accentColor,
      bgColor: p.bgColor, initials: p.initials, scraperEnabled: p.scraperEnabled,
    },
    products: [],
    fromCache: false,
    scraped: false,
  }));
}
