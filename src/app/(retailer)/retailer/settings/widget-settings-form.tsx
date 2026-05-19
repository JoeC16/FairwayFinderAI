"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Check } from "lucide-react";
import type { Retailer, WidgetConfig } from "@prisma/client";

interface Props {
  retailer: Retailer;
  widgetConfig: WidgetConfig | null;
}

export function WidgetSettingsForm({ retailer, widgetConfig }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(widgetConfig?.primaryColor ?? retailer.primaryColor);
  const [welcomeTitle, setWelcomeTitle] = useState(widgetConfig?.welcomeTitle ?? "");
  const [welcomeText, setWelcomeText] = useState(widgetConfig?.welcomeText ?? "");
  const [ctaText, setCtaText] = useState(widgetConfig?.ctaText ?? "");
  const [allowedDomains, setAllowedDomains] = useState((widgetConfig?.allowedDomains ?? []).join(", "));
  const [collectLeads, setCollectLeads] = useState(widgetConfig?.collectLeads ?? true);

  const embedCode = `<script src="${process.env.NEXT_PUBLIC_APP_URL ?? "https://fairwayfit.ai"}/widget.js" data-retailer="${retailer.slug}"></script>\n<div id="fairwayfit-widget"></div>`;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    await fetch(`/api/retailers/${retailer.id}/widget`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        primaryColor,
        welcomeTitle: welcomeTitle || null,
        welcomeText: welcomeText || null,
        ctaText: ctaText || null,
        allowedDomains: allowedDomains.split(",").map((d) => d.trim()).filter(Boolean),
        collectLeads,
      }),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      {/* Branding */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Branding</h2>

        <div className="space-y-1.5">
          <Label>Primary Colour</Label>
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              className="h-10 w-14 rounded-lg border border-gray-200 cursor-pointer"
            />
            <Input
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              placeholder="#166534"
              className="font-mono"
            />
          </div>
        </div>
      </div>

      {/* Copy */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Welcome Screen</h2>

        <div className="space-y-1.5">
          <Label>Headline (optional)</Label>
          <Input
            placeholder="Find Your Perfect Golf Clubs"
            value={welcomeTitle}
            onChange={(e) => setWelcomeTitle(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Sub-text (optional)</Label>
          <Input
            placeholder="Answer a few questions to get personalised recommendations..."
            value={welcomeText}
            onChange={(e) => setWelcomeText(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label>CTA Button Text (optional)</Label>
          <Input
            placeholder="Start My Fitting"
            value={ctaText}
            onChange={(e) => setCtaText(e.target.value)}
          />
        </div>
      </div>

      {/* Security */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Security</h2>

        <div className="space-y-1.5">
          <Label>Allowed Domains (comma separated)</Label>
          <Input
            placeholder="yourgolfshop.com, www.yourgolfshop.com"
            value={allowedDomains}
            onChange={(e) => setAllowedDomains(e.target.value)}
          />
          <p className="text-xs text-gray-400">Leave empty to allow all domains. Use this to prevent unauthorised embedding.</p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={collectLeads}
            onChange={(e) => setCollectLeads(e.target.checked)}
            className="rounded border-gray-300"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Collect leads from widget</p>
            <p className="text-xs text-gray-400">Save golfer contact info as leads in your dashboard.</p>
          </div>
        </label>
      </div>

      {/* Embed code */}
      <div className="bg-brand-900 rounded-2xl p-6">
        <h2 className="font-semibold text-white mb-3">Embed Code</h2>
        <div className="bg-black/30 rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto">
          <pre>{embedCode}</pre>
        </div>
      </div>

      <Button type="submit" variant="gold" size="lg" disabled={saving || saved}>
        {saving ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : saved ? (
          <><Check className="h-4 w-4" /> Saved</>
        ) : (
          "Save Settings"
        )}
      </Button>
    </form>
  );
}
