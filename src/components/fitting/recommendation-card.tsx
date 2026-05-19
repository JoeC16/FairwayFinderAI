"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfidenceMeter } from "./confidence-meter";
import { ExternalLink, ShoppingCart, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { ProductRec } from "@/types/fitting";
import { cn } from "@/lib/utils";

interface Props {
  product: ProductRec;
  rank: number;
}

export function RecommendationCard({ product, rank }: Props) {
  const hasInventoryMatch = !!product.inventoryMatch?.inventoryItemId;
  const price = product.inventoryMatch?.salePrice ?? product.inventoryMatch?.price ?? product.msrp;
  const inStock = (product.inventoryMatch?.stockQty ?? 0) > 0;

  return (
    <div className={cn(
      "bg-white rounded-2xl border p-5 flex flex-col sm:flex-row gap-4",
      rank === 1 ? "border-brand-200 ring-1 ring-brand-200" : "border-gray-100"
    )}>
      {/* Rank badge */}
      <div className="flex sm:flex-col items-center sm:items-start gap-2 sm:gap-1 shrink-0">
        <div className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold",
          rank === 1 ? "bg-brand-800 text-white" : "bg-gray-100 text-gray-600"
        )}>
          {rank}
        </div>
        {rank === 1 && (
          <Badge variant="brand" className="text-xs">Top Pick</Badge>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-2 mb-1">
          <h3 className="font-bold text-gray-900">
            {product.brand} {product.model}
          </h3>
          {product.loft && (
            <Badge variant="outline" className="text-xs">{product.loft}</Badge>
          )}
          {product.flex && (
            <Badge variant="secondary" className="text-xs">{product.flex}</Badge>
          )}
        </div>

        <p className="text-sm text-gray-500 mb-3 leading-relaxed">{product.reasoning}</p>

        {product.specs && (
          <div className="flex flex-wrap gap-2 mb-3">
            {Object.entries(product.specs).slice(0, 3).map(([k, v]) => (
              <span key={k} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                {k}: {String(v)}
              </span>
            ))}
          </div>
        )}

        {hasInventoryMatch && (
          <div className="flex items-center gap-3 bg-green-50 rounded-xl p-3 border border-green-100">
            <div className="flex-1">
              <span className="text-xs text-green-600 font-semibold">Available in stock</span>
              {price && (
                <span className="ml-2 text-sm font-bold text-gray-900">{formatCurrency(price)}</span>
              )}
              {product.inventoryMatch?.salePrice && product.inventoryMatch?.price && (
                <span className="ml-1 text-xs text-gray-400 line-through">{formatCurrency(product.inventoryMatch.price)}</span>
              )}
            </div>
            {product.inventoryMatch?.productUrl && (
              <Button size="sm" variant="default" asChild>
                <a href={product.inventoryMatch.productUrl} target="_blank" rel="noopener noreferrer">
                  <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                  Buy Now
                </a>
              </Button>
            )}
          </div>
        )}

        {!hasInventoryMatch && product.msrp && (
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-sm text-gray-500">MSRP: {formatCurrency(product.msrp)}</span>
          </div>
        )}
      </div>

      {/* Confidence */}
      <div className="flex sm:flex-col items-center gap-3 sm:gap-1">
        <ConfidenceMeter score={product.confidence} size="sm" />
        <span className="text-xs text-gray-400">match</span>
      </div>
    </div>
  );
}
