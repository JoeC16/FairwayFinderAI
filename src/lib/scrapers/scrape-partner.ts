export interface ScrapedProduct {
  name: string;
  price: number;
  originalPrice?: number;
  url: string;
  imageUrl?: string;
  inStock: boolean;
  matchScore: number;
}

interface PartnerConfig {
  id: string;
  website: string;
  searchUrlTemplate: string | null;
  scraperType: string | null;
}

const BOT_UA = "Mozilla/5.0 (compatible; FairwayFitBot/1.0; +https://fairwayfit.ai)";
const TIMEOUT_MS = 9000;
const MAX_RESULTS = 6;
const MIN_MATCH_SCORE = 0.25;

export async function scrapePartner(
  partner: PartnerConfig,
  query: string
): Promise<ScrapedProduct[]> {
  try {
    const signal = AbortSignal.timeout(TIMEOUT_MS);

    if (partner.scraperType === "shopify") {
      return await scrapeShopify(partner.website, query, signal);
    }

    if (partner.scraperType === "jsonld") {
      const searchUrl = buildSearchUrl(partner, query);
      return await scrapeJsonLd(searchUrl, query, signal);
    }

    return [];
  } catch (err) {
    // Gracefully fall back — bot blocking / timeout / parse errors are expected
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[scraper] ${partner.id} failed: ${msg}`);
    return [];
  }
}

// ──────────────────────────────────────────────────────────────
// Shopify: /search.json
// ──────────────────────────────────────────────────────────────

interface ShopifyResult {
  object_type?: string;
  title?: string;
  url?: string;
  image?: string;
  price?: string;
  price_min?: number;
  price_max?: number;
  compare_at_price_min?: number;
  available?: boolean;
}

async function scrapeShopify(
  baseUrl: string,
  query: string,
  signal: AbortSignal
): Promise<ScrapedProduct[]> {
  const url = `${baseUrl}/search.json?q=${encodeURIComponent(query)}&type=product&limit=12`;

  const res = await fetch(url, {
    signal,
    headers: { Accept: "application/json", "User-Agent": BOT_UA },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const data = (await res.json()) as { results?: ShopifyResult[] };
  const results = data.results ?? [];

  return results
    .filter((r) => r.object_type === "product" && r.title)
    .map((r) => {
      const price = r.price_min ? r.price_min / 100 : parsePriceStr(r.price ?? "0");
      const original = r.compare_at_price_min ? r.compare_at_price_min / 100 : undefined;
      const rawUrl = r.url ?? "";
      return {
        name: r.title!,
        price,
        originalPrice: original && original > price ? original : undefined,
        url: rawUrl.startsWith("http") ? rawUrl : `${baseUrl}${rawUrl}`,
        imageUrl: r.image ? (r.image.startsWith("//") ? `https:${r.image}` : r.image) : undefined,
        inStock: r.available ?? true,
        matchScore: scoreMatch(r.title!, query),
      };
    })
    .filter((p) => p.matchScore >= MIN_MATCH_SCORE && p.price > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, MAX_RESULTS);
}

// ──────────────────────────────────────────────────────────────
// JSON-LD: parse application/ld+json Product schemas
// ──────────────────────────────────────────────────────────────

async function scrapeJsonLd(
  url: string,
  query: string,
  signal: AbortSignal
): Promise<ScrapedProduct[]> {
  const res = await fetch(url, {
    signal,
    headers: {
      Accept: "text/html,application/xhtml+xml",
      "User-Agent": BOT_UA,
      "Accept-Language": "en-GB,en;q=0.9",
    },
    cache: "no-store",
  });

  if (!res.ok) return [];

  const html = await res.text();
  const products = extractJsonLdProducts(html, url);

  return products
    .filter((p) => p.matchScore >= MIN_MATCH_SCORE && p.price > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, MAX_RESULTS);
}

interface JsonLdOffer {
  price?: string | number;
  priceCurrency?: string;
  availability?: string;
  url?: string;
}

interface JsonLdProduct {
  "@type"?: string;
  name?: string;
  url?: string;
  image?: string | string[] | { url?: string };
  offers?: JsonLdOffer | JsonLdOffer[];
}

interface JsonLdItemList {
  "@type"?: string;
  itemListElement?: Array<{ item?: JsonLdProduct } | JsonLdProduct>;
}

function extractJsonLdProducts(html: string, pageUrl: string): ScrapedProduct[] {
  const scriptRe = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  const products: ScrapedProduct[] = [];
  let match: RegExpExecArray | null;

  while ((match = scriptRe.exec(html)) !== null) {
    try {
      const data: unknown = JSON.parse(match[1]);
      const nodes: unknown[] = Array.isArray(data) ? data : [data];

      for (const node of nodes) {
        if (!isObject(node)) continue;

        if ((node as JsonLdProduct)["@type"] === "Product") {
          const p = jsonLdToProduct(node as JsonLdProduct, pageUrl);
          if (p) products.push(p);
        }

        if ((node as JsonLdItemList)["@type"] === "ItemList") {
          for (const el of ((node as JsonLdItemList).itemListElement ?? [])) {
            const item = isObject(el) && "item" in (el as object)
              ? (el as { item: JsonLdProduct }).item
              : (el as JsonLdProduct);
            if (item && item["@type"] === "Product") {
              const p = jsonLdToProduct(item, pageUrl);
              if (p) products.push(p);
            }
          }
        }
      }
    } catch {
      // skip bad JSON blobs
    }
  }

  return products;
}

function jsonLdToProduct(node: JsonLdProduct, pageUrl: string): ScrapedProduct | null {
  const name = node.name ?? "";
  if (!name) return null;

  const offers = Array.isArray(node.offers) ? node.offers[0] : node.offers;
  if (!offers) return null;

  const price = parseFloat(String(offers.price ?? "0").replace(/[^0-9.]/g, ""));
  if (!price) return null;

  const url = node.url ?? offers.url ?? pageUrl;
  const image = Array.isArray(node.image)
    ? node.image[0]
    : typeof node.image === "string"
    ? node.image
    : (node.image as { url?: string })?.url;

  const inStock = !offers.availability || offers.availability.toLowerCase().includes("instock");

  return { name, price, url, imageUrl: image, inStock, matchScore: 0 };
}

// ──────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────

function buildSearchUrl(partner: PartnerConfig, query: string): string {
  if (partner.searchUrlTemplate) {
    return partner.searchUrlTemplate.replace("{query}", encodeURIComponent(query));
  }
  return `${partner.website}/search?q=${encodeURIComponent(query)}`;
}

function parsePriceStr(s: string): number {
  const m = s.replace(/[,]/g, "").match(/[\d]+\.?\d*/);
  return m ? parseFloat(m[0]) : 0;
}

export function scoreMatch(name: string, query: string): number {
  const n = name.toLowerCase();
  const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return 0;
  const hits = terms.filter((t) => n.includes(t));
  return hits.length / terms.length;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}
