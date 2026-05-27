"use client";

import { useEffect, useState } from "react";
import { ExternalLink, ShoppingBag, Package, CheckCircle, Loader2, Store } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import type { StockMatch } from "@/app/api/fitting/[sessionId]/retailer-stock/route";

interface ExternalPartner {
  id: string;
  name: string;
  description: string | null;
  tagline: string | null;
  website: string;
  searchUrlTemplate: string | null;
  accentColor: string;
  bgColor: string;
  initials: string | null;
}

interface Props {
  sessionId: string;
  recommendedClubs?: string[];
}

const MATCH_LABELS: Record<string, string> = {
  driver: "Driver",
  irons: "Irons",
  wedge: "Wedge",
};

export function PartnerRetailers({ sessionId, recommendedClubs }: Props) {
  const [matches, setMatches] = useState<StockMatch[]>([]);
  const [partners, setPartners] = useState<ExternalPartner[]>([]);
  const [searchTerms, setSearchTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/fitting/${sessionId}/retailer-stock`)
      .then((r) => r.json())
      .then((d: { matches: StockMatch[]; partners: ExternalPartner[]; searchTerms?: string[] }) => {
        setMatches(d.matches ?? []);
        setPartners(d.partners ?? []);
        setSearchTerms(d.searchTerms ?? []);
      })
      .catch(() => {
        // silently fall back to partners only
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  const searchQuery = searchTerms.join(" ") || recommendedClubs?.join(" ") || "";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShoppingBag className="h-5 w-5 text-brand-600" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">Where to Buy</h2>
          <p className="text-sm text-gray-500">
            {loading ? "Checking stock across retailers..." : matches.length > 0
              ? `Found your recommended clubs at ${matches.length} retailer${matches.length !== 1 ? "s" : ""}`
              : "Browse our retail partners for your recommended equipment"}
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 py-4 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
          <span className="text-sm">Checking retailer stock...</span>
        </div>
      )}

      {/* Platform retailers with real stock */}
      {!loading && matches.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            In Stock — FairwayFit Partner Shops
          </p>
          {matches.map((match) => (
            <div key={match.retailerId} className="rounded-xl border border-green-100 bg-green-50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-9 w-9 rounded-lg bg-brand-600 flex items-center justify-center">
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
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-green-700 bg-green-100 px-1.5 py-0.5 rounded">
                          {MATCH_LABELS[item.matchType] ?? item.matchType}
                        </span>
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {item.brand} {item.model}
                          {item.loft && ` · ${item.loft}`}
                          {item.flex && ` · ${item.flex}`}
                        </p>
                      </div>
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
                        <a
                          href={item.productUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-brand-700 hover:text-brand-900"
                        >
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* External partner links */}
      {!loading && partners.length > 0 && (
        <div className="space-y-3">
          {matches.length > 0 && (
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
              Also Search At
            </p>
          )}
          {partners.map((partner) => {
            const shopUrl = partner.searchUrlTemplate && searchQuery
              ? partner.searchUrlTemplate.replace("{query}", encodeURIComponent(searchQuery))
              : partner.website;

            return (
              <a
                key={partner.id}
                href={shopUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
              >
                <div
                  className="h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ background: partner.bgColor, color: partner.accentColor }}
                >
                  {partner.initials ?? partner.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{partner.name}</p>
                  <p className="text-xs text-gray-500">{partner.description}{partner.tagline ? ` · ${partner.tagline}` : ""}</p>
                </div>
                <div
                  className={cn(
                    "shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white",
                    "opacity-90 group-hover:opacity-100 transition-opacity"
                  )}
                  style={{ background: partner.accentColor }}
                >
                  {searchQuery ? "Search Stock" : "Visit"}
                  <ExternalLink className="h-3 w-3" />
                </div>
              </a>
            );
          })}
        </div>
      )}

      {!loading && matches.length === 0 && partners.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-4">No retailer data available yet.</p>
      )}

      <p className="text-xs text-center text-gray-400 pt-2 border-t border-gray-50">
        {searchQuery && `Searching for: ${searchQuery.slice(0, 60)}`}
      </p>
    </div>
  );
}
