import type { FittingResult, ProductRec, InventoryMatchResult, ShaftFlex } from "@/types/fitting";

interface InventoryItem {
  id: string;
  sku: string;
  brand: string;
  model: string;
  category: string;
  loft?: string | null;
  shaft?: string | null;
  flex?: string | null;
  price: number;
  salePrice?: number | null;
  stockQty: number;
  productUrl?: string | null;
  imageUrl?: string | null;
  available: boolean;
  specs?: Record<string, unknown> | null;
}

interface MatchBreakdown {
  brand: number;
  model: number;
  flex: number;
  loft: number;
  stock: number;
  total: number;
}

const FLEX_ADJACENCY: Record<string, string[]> = {
  ladies:  ["ladies", "senior"],
  senior:  ["senior", "ladies", "regular"],
  regular: ["regular", "senior", "stiff"],
  stiff:   ["stiff", "regular", "x_stiff"],
  x_stiff: ["x_stiff", "stiff", "tour_x"],
  tour_x:  ["tour_x", "x_stiff"],
};

function flexScore(itemFlex: string | null | undefined, targetFlex: ShaftFlex): number {
  if (!itemFlex) return 0;
  const normalised = itemFlex.toLowerCase().replace(/[\s-]/g, "_").replace("x-stiff", "x_stiff").replace("seniors", "senior").replace("extra stiff", "x_stiff");
  if (normalised === targetFlex) return 30;
  const adjacent = FLEX_ADJACENCY[targetFlex] ?? [];
  if (adjacent.includes(normalised)) return 15;
  return 0;
}

function loftScore(itemLoft: string | null | undefined, targetLoft: number | undefined): number {
  if (!itemLoft || !targetLoft) return 0;
  const parsed = parseFloat(itemLoft.replace("°", "").trim());
  if (isNaN(parsed)) return 0;
  const diff = Math.abs(parsed - targetLoft);
  if (diff <= 0.5)  return 25;
  if (diff <= 1.0)  return 18;
  if (diff <= 1.5)  return 10;
  if (diff <= 2.0)  return 5;
  return 0;
}

function brandScore(itemBrand: string, targetBrands: string[]): number {
  if (!targetBrands.length) return 5;
  const normalised = itemBrand.toLowerCase();
  for (const brand of targetBrands) {
    if (normalised.includes(brand.toLowerCase())) return 15;
  }
  return 5;
}

function modelScore(itemModel: string, targetModel: string | undefined): number {
  if (!targetModel) return 0;
  const item = itemModel.toLowerCase();
  const target = targetModel.toLowerCase();
  if (item === target) return 30;
  if (item.includes(target) || target.includes(item)) return 20;
  return 0;
}

function scoreInventoryItem(
  item: InventoryItem,
  rec: ProductRec,
  targetFlex?: ShaftFlex,
  targetLoft?: number
): MatchBreakdown {
  if (!item.available || item.stockQty <= 0) {
    return { brand: 0, model: 0, flex: 0, loft: 0, stock: 0, total: 0 };
  }

  const brand = brandScore(item.brand, [rec.brand]);
  const model = modelScore(item.model, rec.model);
  const flex = flexScore(item.flex, targetFlex ?? "regular");
  const loft = loftScore(item.loft, targetLoft);
  const stock = item.stockQty > 0 ? 10 : 0;

  const total = brand + model + flex + loft + stock;

  return { brand, model, flex, loft, stock, total };
}

export function matchInventory(
  inventory: InventoryItem[],
  fittingResult: FittingResult
): FittingResult {
  // Build category-specific inventory lookups
  const byCategory = new Map<string, InventoryItem[]>();
  for (const item of inventory) {
    const list = byCategory.get(item.category.toLowerCase()) ?? [];
    list.push(item);
    byCategory.set(item.category.toLowerCase(), list);
  }

  function findBestMatch(
    rec: ProductRec,
    categoryKey: string,
    flex?: ShaftFlex,
    loft?: number
  ): InventoryMatchResult | undefined {
    const candidates = byCategory.get(categoryKey) ?? [];
    if (!candidates.length) return undefined;

    let best: { item: InventoryItem; breakdown: MatchBreakdown } | null = null;

    for (const item of candidates) {
      const breakdown = scoreInventoryItem(item, rec, flex, loft);
      if (breakdown.total < 15) continue; // Minimum threshold
      if (!best || breakdown.total > best.breakdown.total) {
        best = { item, breakdown };
      }
    }

    if (!best) return undefined;

    return {
      inventoryItemId: best.item.id,
      sku: best.item.sku,
      price: best.item.price,
      salePrice: best.item.salePrice ?? undefined,
      productUrl: best.item.productUrl ?? undefined,
      imageUrl: best.item.imageUrl ?? undefined,
      stockQty: best.item.stockQty,
      matchScore: Math.min(Math.round(best.breakdown.total), 100),
    };
  }

  // Attach matches to driver recommendations
  if (fittingResult.driver.recommendedProducts) {
    fittingResult.driver.recommendedProducts = fittingResult.driver.recommendedProducts.map((rec) => ({
      ...rec,
      inventoryMatch: findBestMatch(rec, "driver", fittingResult.driver.flex, fittingResult.driver.loft),
    }));
  }

  // Attach matches to iron recommendations
  if (fittingResult.irons.recommendedProducts) {
    fittingResult.irons.recommendedProducts = fittingResult.irons.recommendedProducts.map((rec) => ({
      ...rec,
      inventoryMatch: findBestMatch(rec, "iron_set", fittingResult.irons.flex),
    }));
  }

  // Attach matches to wedge recommendations
  if (fittingResult.wedges.recommendedProducts) {
    fittingResult.wedges.recommendedProducts = fittingResult.wedges.recommendedProducts.map((rec) => ({
      ...rec,
      inventoryMatch: findBestMatch(rec, "wedge"),
    }));
  }

  return fittingResult;
}

export function getInventoryMatchSummary(fittingResult: FittingResult): {
  totalRecommendations: number;
  matchedInInventory: number;
  availableItems: InventoryMatchResult[];
  totalEstimatedCost: number;
} {
  const allRecs = [
    ...fittingResult.driver.recommendedProducts.slice(0, 1),
    ...fittingResult.irons.recommendedProducts.slice(0, 1),
    ...fittingResult.wedges.recommendedProducts.slice(0, 1),
  ];

  const matched = allRecs.filter((r) => r.inventoryMatch?.inventoryItemId);
  const available = matched
    .map((r) => r.inventoryMatch!)
    .filter(Boolean);

  const totalCost = available.reduce((sum, m) => sum + (m.salePrice ?? m.price), 0);

  return {
    totalRecommendations: allRecs.length,
    matchedInInventory: matched.length,
    availableItems: available,
    totalEstimatedCost: totalCost,
  };
}
