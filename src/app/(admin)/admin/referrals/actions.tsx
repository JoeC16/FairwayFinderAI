"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2, Loader2, Power } from "lucide-react";

interface Partner {
  id: string;
  code: string;
  name: string;
  email: string | null;
  commissionRate: number;
  active: boolean;
}

export function CreateReferralPartnerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", email: "", commissionRate: "0.20" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/admin/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, commissionRate: parseFloat(form.commissionRate) }),
    });
    const data = await res.json() as { error?: string; code?: string };

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to create partner");
      return;
    }
    setSuccess(`Partner created — share links with ?ref=${data.code}`);
    setForm({ name: "", code: "", email: "", commissionRate: "0.20" });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <UserPlus className="h-5 w-5 text-brand-700" />
        <h2 className="font-semibold text-gray-900">Create Referral Partner</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="name">Partner Name</Label>
          <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="code">Referral Code</Label>
          <Input id="code" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} required placeholder="e.g. JOHNDOE10" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email (optional)</Label>
          <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="commissionRate">Commission Rate (0–1)</Label>
          <Input id="commissionRate" type="number" min={0} max={1} step={0.01} value={form.commissionRate} onChange={e => setForm(f => ({ ...f, commissionRate: e.target.value }))} required />
        </div>
        {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
        {success && <p className="col-span-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{success}</p>}
        <div className="col-span-2">
          <Button type="submit" disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Partner
          </Button>
        </div>
      </form>
    </div>
  );
}

export function ReferralPartnerActions({ partner }: { partner: Partner }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"toggle" | "delete" | null>(null);

  async function toggleActive() {
    setLoading("toggle");
    await fetch(`/api/admin/referrals/${partner.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !partner.active }),
    });
    setLoading(null);
    router.refresh();
  }

  async function remove() {
    if (!confirm(`Delete referral partner "${partner.name}"? This removes their conversion history.`)) return;
    setLoading("delete");
    await fetch(`/api/admin/referrals/${partner.id}`, { method: "DELETE" });
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={partner.active ? "brand" : "secondary"} className="text-xs">
        {partner.active ? "Active" : "Disabled"}
      </Badge>
      <span className="text-xs text-gray-400">{Math.round(partner.commissionRate * 100)}% commission</span>
      <Button size="sm" variant="outline" onClick={toggleActive} disabled={loading !== null} className="gap-1 h-7 text-xs">
        {loading === "toggle" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Power className="h-3 w-3" />}
        {partner.active ? "Disable" : "Enable"}
      </Button>
      <Button size="sm" variant="ghost" onClick={remove} disabled={loading !== null} className="gap-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
        {loading === "delete" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        Delete
      </Button>
    </div>
  );
}
