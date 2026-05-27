"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Store, ExternalLink, Plus, Edit2, Trash2, ToggleLeft, ToggleRight,
  ChevronDown, ChevronUp, Loader2, Globe,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface RetailerRow {
  id: string; name: string; email: string; slug: string;
  plan: string; active: boolean; inventoryCount: number;
  fittingsCount: number; leadsCount: number;
  subscriptionStatus: string | null; fittingsLimit: number | null;
  createdAt: string;
}

interface PartnerRow {
  id: string; name: string; slug: string; description: string | null;
  tagline: string | null; website: string; searchUrlTemplate: string | null;
  accentColor: string; bgColor: string; initials: string | null;
  countries: string[]; active: boolean; sortOrder: number;
  scraperEnabled: boolean; scraperType: string | null;
}

interface Props {
  retailers: RetailerRow[];
  partners: PartnerRow[];
}

const EMPTY_PARTNER = {
  name: "", slug: "", description: "", tagline: "",
  website: "", searchUrlTemplate: "", accentColor: "#166534",
  bgColor: "#f0fdf4", initials: "", countries: "", sortOrder: 0,
  scraperEnabled: false, scraperType: "none",
};

type PartnerForm = typeof EMPTY_PARTNER;

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function RetailersAdminClient({ retailers: initRetailers, partners: initPartners }: Props) {
  const [tab, setTab] = useState<"platform" | "partners">("platform");
  const [retailers, setRetailers] = useState(initRetailers);
  const [partners, setPartners] = useState(initPartners);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Partner modal
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PartnerRow | null>(null);
  const [form, setForm] = useState<PartnerForm>(EMPTY_PARTNER);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_PARTNER);
    setShowModal(true);
  }

  function openEdit(p: PartnerRow) {
    setEditing(p);
    setForm({
      name: p.name,
      slug: p.slug,
      description: p.description ?? "",
      tagline: p.tagline ?? "",
      website: p.website,
      searchUrlTemplate: p.searchUrlTemplate ?? "",
      accentColor: p.accentColor,
      bgColor: p.bgColor,
      initials: p.initials ?? "",
      countries: p.countries.join(", "),
      sortOrder: p.sortOrder,
      scraperEnabled: p.scraperEnabled,
      scraperType: p.scraperType ?? "none",
    });
    setShowModal(true);
  }

  function setField(key: keyof PartnerForm, val: string | number | boolean) {
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === "name" && !editing) {
        next.slug = slugify(val as string);
        if (!next.initials) next.initials = (val as string).split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 3);
      }
      return next;
    });
  }

  async function savePartner() {
    setSaving(true);
    try {
      const payload = {
        ...form,
        countries: form.countries.split(",").map((c) => c.trim()).filter(Boolean),
        sortOrder: Number(form.sortOrder),
        scraperType: form.scraperType === "none" ? null : form.scraperType,
      };

      if (editing) {
        const res = await fetch(`/api/admin/partners/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const { partner } = await res.json() as { partner: PartnerRow };
        setPartners((prev) => prev.map((p) => p.id === editing.id ? partner : p));
      } else {
        const res = await fetch("/api/admin/partners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const { partner } = await res.json() as { partner: PartnerRow };
        setPartners((prev) => [...prev, partner].sort((a, b) => a.sortOrder - b.sortOrder));
      }
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  }

  async function deletePartner(id: string) {
    if (!confirm("Delete this partner? This cannot be undone.")) return;
    setDeleting(id);
    await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
    setPartners((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  }

  async function togglePartnerActive(partner: PartnerRow) {
    setTogglingId(partner.id);
    const res = await fetch(`/api/admin/partners/${partner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !partner.active }),
    });
    const { partner: updated } = await res.json() as { partner: PartnerRow };
    setPartners((prev) => prev.map((p) => p.id === partner.id ? updated : p));
    setTogglingId(null);
  }

  async function toggleRetailerActive(retailer: RetailerRow) {
    setTogglingId(retailer.id);
    const res = await fetch(`/api/admin/retailers/${retailer.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !retailer.active }),
    });
    const { retailer: updated } = await res.json() as { retailer: RetailerRow };
    setRetailers((prev) => prev.map((r) => r.id === retailer.id ? updated : r));
    setTogglingId(null);
  }

  function reorder(id: string, dir: -1 | 1) {
    const sorted = [...partners].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((p) => p.id === id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    const newOrder = sorted[idx].sortOrder;
    const swapOrder = swap.sortOrder;
    fetch(`/api/admin/partners/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sortOrder: swapOrder }),
    });
    fetch(`/api/admin/partners/${swap.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sortOrder: newOrder }),
    });
    setPartners((prev) => prev.map((p) =>
      p.id === id ? { ...p, sortOrder: swapOrder } :
      p.id === swap.id ? { ...p, sortOrder: newOrder } : p
    ));
  }

  const sortedPartners = [...partners].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Retailers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage platform retailers and external partner links</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {(["platform", "partners"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            {t === "platform" ? `Platform Retailers (${retailers.length})` : `Partner Links (${partners.length})`}
          </button>
        ))}
      </div>

      {/* Platform retailers table */}
      {tab === "platform" && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Retailer</th>
                <th className="px-5 py-3 font-medium text-gray-500">Plan</th>
                <th className="px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 font-medium text-gray-500">Inventory</th>
                <th className="px-5 py-3 font-medium text-gray-500">Fittings</th>
                <th className="px-5 py-3 font-medium text-gray-500">Joined</th>
                <th className="px-5 py-3 font-medium text-gray-500">Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {retailers.map((retailer) => (
                <tr key={retailer.id} className={cn("hover:bg-gray-50", !retailer.active && "opacity-50")}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{retailer.name}</p>
                    <p className="text-xs text-gray-400">{retailer.email} · /{retailer.slug}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={retailer.plan === "ENTERPRISE" ? "gold" : "brand"} className="text-xs capitalize">
                      {retailer.plan.toLowerCase()}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge
                      variant={retailer.subscriptionStatus === "active" ? "success" : retailer.subscriptionStatus === "trialing" ? "warning" : "secondary"}
                      className="text-xs"
                    >
                      {retailer.subscriptionStatus ?? "none"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{retailer.inventoryCount} items</td>
                  <td className="px-5 py-3 text-gray-600">
                    {retailer.fittingsCount}
                    {retailer.fittingsLimit && <span className="text-gray-400 text-xs"> / {retailer.fittingsLimit}</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {format(new Date(retailer.createdAt), "MMM d, yyyy")}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleRetailerActive(retailer)}
                      disabled={togglingId === retailer.id}
                      className="text-gray-400 hover:text-brand-600 transition-colors"
                    >
                      {togglingId === retailer.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : retailer.active ? (
                        <ToggleRight className="h-6 w-6 text-brand-600" />
                      ) : (
                        <ToggleLeft className="h-6 w-6" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {retailers.length === 0 && (
            <div className="p-12 text-center">
              <Store className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400">No platform retailers yet.</p>
            </div>
          )}
        </div>
      )}

      {/* External partner links */}
      {tab === "partners" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="gold" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Partner
            </Button>
          </div>

          {sortedPartners.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <Globe className="h-10 w-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 mb-4">No external partners yet.</p>
              <Button variant="outline" onClick={openCreate}>Add your first partner</Button>
            </div>
          )}

          <div className="space-y-3">
            {sortedPartners.map((partner, idx) => (
              <div
                key={partner.id}
                className={cn(
                  "bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4",
                  !partner.active && "opacity-60"
                )}
              >
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => reorder(partner.id, -1)} disabled={idx === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-0">
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button onClick={() => reorder(partner.id, 1)} disabled={idx === sortedPartners.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-0">
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>

                {/* Logo preview */}
                <div
                  className="h-12 w-12 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ background: partner.bgColor, color: partner.accentColor }}
                >
                  {partner.initials ?? partner.name.slice(0, 2).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{partner.name}</p>
                    {!partner.active && <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                    {partner.countries.length > 0 && (
                      <span className="text-xs text-gray-400">{partner.countries.join(", ")}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">{partner.description}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{partner.website}</p>
                  {partner.searchUrlTemplate && (
                    <p className="text-xs text-brand-600 truncate mt-0.5 font-mono">{partner.searchUrlTemplate}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1">
                    {partner.scraperEnabled && partner.scraperType ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full font-medium">
                        ● Scraping: {partner.scraperType}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">No scraper</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-600">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button onClick={() => togglePartnerActive(partner)} disabled={togglingId === partner.id} className="text-gray-400 hover:text-brand-600 transition-colors">
                    {togglingId === partner.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : partner.active ? (
                      <ToggleRight className="h-6 w-6 text-brand-600" />
                    ) : (
                      <ToggleLeft className="h-6 w-6" />
                    )}
                  </button>
                  <Button size="sm" variant="ghost" onClick={() => openEdit(partner)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => deletePartner(partner.id)}
                    disabled={deleting === partner.id}
                  >
                    {deleting === partner.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Partner Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Partner" : "Add External Partner"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Name *</Label>
                <Input value={form.name} onChange={(e) => setField("name", e.target.value)} placeholder="American Golf" />
              </div>
              <div className="space-y-1.5">
                <Label>Slug *</Label>
                <Input value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="american-golf" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Website URL *</Label>
              <Input value={form.website} onChange={(e) => setField("website", e.target.value)} placeholder="https://www.americangolf.co.uk" type="url" />
            </div>

            <div className="space-y-1.5">
              <Label>Search URL Template</Label>
              <Input value={form.searchUrlTemplate} onChange={(e) => setField("searchUrlTemplate", e.target.value)} placeholder="https://www.americangolf.co.uk/search?query={query}" />
              <p className="text-xs text-gray-400">Use <code className="bg-gray-100 px-1 rounded">{"{query}"}</code> where the search term goes</p>
            </div>

            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="UK's largest golf retailer with 100+ stores" />
            </div>

            <div className="space-y-1.5">
              <Label>Tagline</Label>
              <Input value={form.tagline} onChange={(e) => setField("tagline", e.target.value)} placeholder="Expert fitting & top brands" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Initials</Label>
                <Input value={form.initials} onChange={(e) => setField("initials", e.target.value)} placeholder="AG" maxLength={4} />
              </div>
              <div className="space-y-1.5">
                <Label>Accent colour</Label>
                <div className="flex gap-2">
                  <input type="color" value={form.accentColor} onChange={(e) => setField("accentColor", e.target.value)} className="h-9 w-12 rounded border border-gray-200 cursor-pointer" />
                  <Input value={form.accentColor} onChange={(e) => setField("accentColor", e.target.value)} className="font-mono text-xs" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Background colour</Label>
                <div className="flex gap-2">
                  <input type="color" value={form.bgColor} onChange={(e) => setField("bgColor", e.target.value)} className="h-9 w-12 rounded border border-gray-200 cursor-pointer" />
                  <Input value={form.bgColor} onChange={(e) => setField("bgColor", e.target.value)} className="font-mono text-xs" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Countries (comma-separated)</Label>
                <Input value={form.countries} onChange={(e) => setField("countries", e.target.value)} placeholder="GB, IE" />
              </div>
              <div className="space-y-1.5">
                <Label>Sort order</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setField("sortOrder", Number(e.target.value))} min={0} />
              </div>
            </div>

            {/* Scraper config */}
            <div className="rounded-xl border border-brand-100 bg-brand-50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-900">Stock Scraping</p>
                  <p className="text-xs text-brand-700 mt-0.5">
                    When enabled, FairwayFit scans this retailer&apos;s site for recommended clubs (cached 12 hours).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setField("scraperEnabled", !form.scraperEnabled)}
                  className="text-brand-600 hover:text-brand-800"
                >
                  {form.scraperEnabled
                    ? <ToggleRight className="h-7 w-7 text-brand-600" />
                    : <ToggleLeft className="h-7 w-7 text-gray-400" />}
                </button>
              </div>

              {form.scraperEnabled && (
                <div className="space-y-1.5">
                  <Label>Scraper type</Label>
                  <select
                    value={form.scraperType}
                    onChange={(e) => setField("scraperType", e.target.value)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="none">— Select type —</option>
                    <option value="shopify">Shopify (/search.json API)</option>
                    <option value="jsonld">JSON-LD (structured product schema in HTML)</option>
                  </select>
                  <p className="text-xs text-brand-700">
                    {form.scraperType === "shopify" && "Works for Shopify stores. Calls /search.json — fast and reliable."}
                    {form.scraperType === "jsonld" && "Fetches the search page and extracts Product schema from the HTML. Works on most SEO-optimised stores."}
                    {form.scraperType === "none" && "Choose a type to enable scraping."}
                  </p>
                </div>
              )}
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-gray-100 p-3 bg-gray-50">
              <p className="text-xs text-gray-400 mb-2">Preview</p>
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ background: form.bgColor, color: form.accentColor }}
                >
                  {form.initials || "?"}
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">{form.name || "Partner Name"}</p>
                  <p className="text-xs text-gray-500">{form.description || "Description"}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: form.accentColor }}>
                  Search Stock <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="gold" onClick={savePartner} disabled={saving || !form.name || !form.slug || !form.website}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editing ? "Save Changes" : "Add Partner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
