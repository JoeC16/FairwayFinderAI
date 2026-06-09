"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format, isPast } from "date-fns";
import { UserPlus, RefreshCw, Trash2, Loader2 } from "lucide-react";

interface Promoter {
  userId: string;
  promoterUntil: string | null;
  user: { id: string; name: string | null; email: string };
}

export function CreatePromoterForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", months: "12" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/admin/promoters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, months: parseInt(form.months, 10) }),
    });
    const data = await res.json() as { error?: string; email?: string; promoterUntil?: string };

    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to create account");
      return;
    }
    setSuccess(`Account created for ${data.email} — access until ${format(new Date(data.promoterUntil!), "MMM d, yyyy")}`);
    setForm({ name: "", email: "", password: "", months: "12" });
    router.refresh();
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6">
      <div className="flex items-center gap-2 mb-5">
        <UserPlus className="h-5 w-5 text-brand-700" />
        <h2 className="font-semibold text-gray-900">Create Promoter Account</h2>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="password">Temporary Password</Label>
          <Input id="password" type="text" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required minLength={8} placeholder="min. 8 characters" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="months">Access Duration (months)</Label>
          <Input id="months" type="number" min={1} max={120} value={form.months} onChange={e => setForm(f => ({ ...f, months: e.target.value }))} required />
        </div>
        {error && <p className="col-span-2 text-sm text-red-600">{error}</p>}
        {success && <p className="col-span-2 text-sm text-green-700 bg-green-50 rounded-lg px-3 py-2">{success}</p>}
        <div className="col-span-2">
          <Button type="submit" disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
}

export function PromoterActions({ promoter }: { promoter: Promoter }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"extend" | "revoke" | null>(null);

  async function extend() {
    setLoading("extend");
    await fetch(`/api/admin/promoters/${promoter.userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ months: 12 }),
    });
    setLoading(null);
    router.refresh();
  }

  async function revoke() {
    if (!confirm(`Revoke access for ${promoter.user.email}?`)) return;
    setLoading("revoke");
    await fetch(`/api/admin/promoters/${promoter.userId}`, { method: "DELETE" });
    setLoading(null);
    router.refresh();
  }

  const expired = promoter.promoterUntil ? isPast(new Date(promoter.promoterUntil)) : true;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={expired ? "secondary" : "brand"} className="text-xs">
        {expired ? "Expired" : "Active"}
      </Badge>
      {promoter.promoterUntil && (
        <span className="text-xs text-gray-400">
          {expired ? "Expired" : "Until"} {format(new Date(promoter.promoterUntil), "MMM d, yyyy")}
        </span>
      )}
      <Button size="sm" variant="outline" onClick={extend} disabled={loading !== null} className="gap-1 h-7 text-xs">
        {loading === "extend" ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
        +12 mo
      </Button>
      <Button size="sm" variant="ghost" onClick={revoke} disabled={loading !== null} className="gap-1 h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50">
        {loading === "revoke" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
        Revoke
      </Button>
    </div>
  );
}
