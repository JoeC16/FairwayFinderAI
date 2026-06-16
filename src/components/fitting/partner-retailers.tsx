"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink, ShoppingBag, CheckCircle, Loader2, Store,
  Package, Tag, AlertCircle, RefreshCw,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { StockMatch, PartnerResult } from "@/app/api/fitting/[sessionId]/retailer-stock/route";

interface Props {
  sessionId: string;
  recommendedClubs?: string[];
}

interface StockResponse {
  matches: StockMatch[];
  partnerResults: PartnerResult[];
  searchTerms: string[];
}

const MATCH_LABELS: Record<string, string> = { driver: "Driver", irons: "Irons", wedge: "Wedge" };

export function PartnerRetailers({ sessionId, recommendedClubs }: Props) {
  const [data, setData] = useState<StockResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  function load() {
    setLoading(true);
    setError(false);
    fetch(`/api/fitting/${sessionId}/retailer-stock`)
      .then((r) => r.json())
      .then((d: StockResponse) => setData(d))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }

  useEffect(load, [sessionId]);

  const searchTerms: string[] = data?.searchTerms?.length ? data.searchTerms : (recommendedClubs ?? []);
  const searchQuery = searchTerms.join(" ");
  const matches = data?.matches ?? [];
  const partnerResults = data?.partnerResults ?? [];
  const scrapedPartners = partnerResults.filter((p) => p.scraped);
  const linkOnlyPartners = partnerResults.filter((p) => !p.scraped);

  const totalResultsFound =
    matches.length +
    scrapedPartners.filter((p) => p.products.length > 0).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-brand-600" />
          <div>
            <h2 className="text-lg font-bold text-gray-900">Where to Buy</h2>
            <p className="text-sm text-gray-500">
              {loading
                ? "Checking stock across retailers..."
                : error
                ? "Could not load stock data"
                : totalResultsFound > 0
                ? `Found your clubs at ${totalResultsFound} retailer${totalResultsFound !== 1 ? "s" : ""}`
                : "Browse retailers for your recommended equipment"}
            </p>
          </div>
        </div>
        {!loading && (
          <button onClick={load} className="text-gray-400 hover:text-gray-600 transition-colors" title="Refresh">
            <RefreshCw className="h-4 w-4" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-6 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
          <span className="text-sm">Scanning retailer stock for your clubs...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 py-4 text-red-500">
          <AlertCircle className="h-4 w-4" />
          <span className="text-sm">Stock check failed. </span>
          <button onClick={load} className="text-sm text-brand-600 hover:underline">Try again</button>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Platform retailers with real inventory */}
          {matches.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                In Stock — FairwayFit Partner Shops
              </p>
              {matches.map((match) => (
                <PlatformRetailerCard key={match.retailerId} match={match} />
              ))}
            </div>
          )}

          {/* Scraped external partners */}
          {scrapedPartners.length > 0 && (
            <div className="space-y-4">
              {matches.length > 0 && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Package className="h-3.5 w-3.5" />
                  Also Available Online
                </p>
              )}
              {scrapedPartners.map((pr) => (
                <ScrapedPartnerCard key={pr.partner.id} result={pr} searchQuery={searchQuery} />
              ))}
            </div>
          )}

          {/* Link-only partners */}
          {linkOnlyPartners.length > 0 && (
            <div className="space-y-3">
              {(matches.length > 0 || scrapedPartners.length > 0) && (
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  More Places to Search
                </p>
              )}
              {linkOnlyPartners.map((pr) => (
                <LinkPartnerCard key={pr.partner.id} result={pr} searchTerms={searchTerms} />
              ))}
            </div>
          )}

          {matches.length === 0 && partnerResults.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">No retailer data available yet.</p>
          )}
        </>
      )}

      {searchQuery && !loading && (
        <p className="text-xs text-center text-gray-400 border-t border-gray-50 pt-3">
          Searching for: <span className="font-medium">{searchQuery.slice(0, 80)}</span>
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function PlatformRetailerCard({ match }: { match: StockMatch }) {
  return (
    <div className="rounded-xl border border-green-100 bg-green-50 p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center shrink-0">
          <Store className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">{match.retailerName}</p>
          <p className="text-xs text-green-700">{match.items.length} matching item{match.items.length !== 1 ? "s" : ""} in stock</p>
        </div>
      </div>
      <div className="space-y-2">
        {match.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 bg-white rounded-lg px-3 py-2 border border-green-100">
            <div className="min-w-0 flex items-center gap-2">
              <span className="text-xs font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded shrink-0">
                {MATCH_LABELS[item.matchType] ?? item.matchType}
              </span>
              <p className="text-sm font-medium text-gray-800 truncate">
                {item.brand} {item.model}
                {item.loft && ` · ${item.loft}`}
                {item.flex && ` · ${item.flex}`}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {item.salePrice ? (
                <div className="text-right">
                  <span className="text-sm font-bold text-green-700">{formatCurrency(item.salePrice)}</span>
                  <span className="text-xs text-gray-400 line-through ml-1">{formatCurrency(item.price)}</span>
                </div>
              ) : (
                <span className="text-sm font-semibold text-gray-700">{formatCurrency(item.price)}</span>
              )}
              {item.productUrl && (
                <a href={item.productUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-900">
                  View <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScrapedPartnerCard({ result, searchQuery }: { result: PartnerResult; searchQuery: string }) {
  const { partner, products, fromCache } = result;
  const searchUrl = partner.searchUrlTemplate
    ? partner.searchUrlTemplate.replace("{query}", encodeURIComponent(searchQuery))
    : partner.website;

  return (
    <div className="rounded-xl border border-gray-100 overflow-hidden">
      {/* Partner header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-100">
        <div
          className="h-9 w-9 rounded-lg flex items-center justify-center font-bold text-sm shrink-0"
          style={{ background: partner.bgColor, color: partner.accentColor }}
        >
          {partner.initials ?? partner.name.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{partner.name}</p>
          <p className="text-xs text-gray-500">
            {products.length > 0
              ? `${products.length} result${products.length !== 1 ? "s" : ""} found`
              : "No exact matches found"}
            {fromCache && <span className="text-gray-400"> · cached</span>}
          </p>
        </div>
        <a href={searchUrl} target="_blank" rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
          style={{ background: partner.accentColor }}>
          See All <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Product rows */}
      {products.length > 0 ? (
        <div className="divide-y divide-gray-50">
          {products.map((product, i) => (
            <a
              key={i}
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group"
            >
              {product.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.imageUrl} alt={product.name} className="h-12 w-12 object-contain rounded-lg bg-white border border-gray-100 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate group-hover:text-brand-700">{product.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {product.inStock ? (
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                      In stock
                    </span>
                  ) : (
                    <span className="text-xs text-red-500">Out of stock</span>
                  )}
                </div>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-sm font-bold text-gray-900">{formatCurrency(product.price)}</p>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-xs text-gray-400 line-through">{formatCurrency(product.originalPrice)}</p>
                )}
              </div>
              <ExternalLink className="h-4 w-4 text-gray-300 group-hover:text-brand-500 shrink-0" />
            </a>
          ))}
        </div>
      ) : (
        <div className="px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-gray-400">No exact matches — try searching manually</p>
          <a href={searchUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs text-brand-600 hover:underline flex items-center gap-1">
            Search <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}
    </div>
  );
}

function LinkPartnerCard({ result, searchTerms }: { result: PartnerResult; searchTerms: string[] }) {
  const { partner } = result;

  const links =
    searchTerms.length > 0 && partner.searchUrlTemplate
      ? searchTerms.map((term) => ({
          label: term,
          url: partner.searchUrlTemplate!.replace("{query}", encodeURIComponent(term)),
        }))
      : [{ label: `Visit ${partner.name}`, url: partner.website }];

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
        style={{ background: partner.bgColor, color: partner.accentColor }}
      >
        {partner.initials ?? partner.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">{partner.name}</p>
        <p className="text-xs text-gray-500 truncate">{partner.description}{partner.tagline ? ` · ${partner.tagline}` : ""}</p>
      </div>
      <div className="shrink-0 flex flex-col gap-1.5 items-end">
        {links.map(({ label, url }) => (
          <a
            key={label}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white")}
            style={{ background: partner.accentColor }}
          >
            <Tag className="h-3 w-3 shrink-0" />
            <span className="truncate max-w-[140px]">{label}</span>
            <ExternalLink className="h-3 w-3 shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
