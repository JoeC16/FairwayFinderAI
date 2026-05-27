"use client";

import { ExternalLink, ShoppingBag } from "lucide-react";

interface PartnerRetailer {
  name: string;
  description: string;
  tagline: string;
  website: string;
  searchBase: string;
  initials: string;
  accentColor: string;
  bgColor: string;
  textColor: string;
}

const PARTNERS: PartnerRetailer[] = [
  {
    name: "American Golf",
    description: "UK's largest golf retailer",
    tagline: "100+ stores & expert fitters",
    website: "https://www.americangolf.co.uk",
    searchBase: "https://www.americangolf.co.uk/search?query=",
    initials: "AG",
    accentColor: "#e31837",
    bgColor: "#fff1f2",
    textColor: "#9f1239",
  },
  {
    name: "McGuirks Golf",
    description: "Ireland's leading golf retailer",
    tagline: "Premium brands & custom fitting",
    website: "https://www.mcguirksgolf.com",
    searchBase: "https://www.mcguirksgolf.com/catalogsearch/result/?q=",
    initials: "MG",
    accentColor: "#006837",
    bgColor: "#f0fdf4",
    textColor: "#14532d",
  },
  {
    name: "Affordable Golf",
    description: "Best value in the UK",
    tagline: "Top brands at great prices",
    website: "https://www.affordablegolf.co.uk",
    searchBase: "https://www.affordablegolf.co.uk/search?q=",
    initials: "AfG",
    accentColor: "#1d4ed8",
    bgColor: "#eff6ff",
    textColor: "#1e3a8a",
  },
];

interface Props {
  recommendedClubs?: string[];
}

export function PartnerRetailers({ recommendedClubs }: Props) {
  const searchQuery = recommendedClubs?.slice(0, 2).join(" ").trim() ?? "";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-3 mb-5">
        <ShoppingBag className="h-5 w-5 text-brand-600" />
        <div>
          <h2 className="text-lg font-bold text-gray-900">Shop Your Recommendations</h2>
          <p className="text-sm text-gray-500">Browse our retail partners to find and purchase your fitted clubs</p>
        </div>
      </div>

      <div className="grid gap-3">
        {PARTNERS.map((partner) => {
          const shopUrl = searchQuery
            ? `${partner.searchBase}${encodeURIComponent(searchQuery)}`
            : partner.website;

          return (
            <a
              key={partner.name}
              href={shopUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
            >
              {/* Logo / initials */}
              <div
                className="h-12 w-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                style={{ background: partner.bgColor, color: partner.accentColor }}
              >
                {partner.initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">{partner.name}</p>
                <p className="text-xs text-gray-500">{partner.description} · {partner.tagline}</p>
              </div>

              {/* CTA */}
              <div
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-opacity group-hover:opacity-90"
                style={{ background: partner.accentColor, color: "white" }}
              >
                {searchQuery ? "Shop Now" : "Visit"}
                <ExternalLink className="h-3 w-3" />
              </div>
            </a>
          );
        })}
      </div>

      <p className="text-xs text-center text-gray-400 mt-4">
        Links open the retailer&apos;s site in a new tab.{" "}
        {searchQuery && "Pre-filtered for your recommended equipment."}
      </p>
    </div>
  );
}
