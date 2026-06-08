"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  "DRIVER", "FAIRWAY_WOOD", "HYBRID", "DRIVING_IRON",
  "IRON_SET", "INDIVIDUAL_IRON", "WEDGE", "PUTTER",
  "SHAFT", "GRIP", "BAG", "ACCESSORY",
];

const CATEGORY_LABELS: Record<string, string> = {
  DRIVER: "Driver", FAIRWAY_WOOD: "Fairway Wood", HYBRID: "Hybrid",
  DRIVING_IRON: "Driving Iron", IRON_SET: "Iron Set", INDIVIDUAL_IRON: "Iron",
  WEDGE: "Wedge", PUTTER: "Putter", SHAFT: "Shaft", GRIP: "Grip",
  BAG: "Bag", ACCESSORY: "Accessory",
};

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    brand: "", model: "", category: "DRIVER", year: "", msrp: "", description: "",
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          year: form.year ? Number(form.year) : null,
          msrp: form.msrp ? Number(form.msrp) : null,
        }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Failed to create product");
      }
      router.push("/admin/products");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/admin/products"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Product</h1>
          <p className="text-gray-500 text-sm mt-0.5">Add a new club to the product database</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Brand *</Label>
            <Input placeholder="e.g. TaylorMade" value={form.brand} onChange={(e) => set("brand", e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Model *</Label>
            <Input placeholder="e.g. Stealth 2" value={form.model} onChange={(e) => set("model", e.target.value)} required />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Category *</Label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            required
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Year</Label>
            <Input type="number" placeholder="2024" min="1990" max="2030" value={form.year} onChange={(e) => set("year", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>MSRP (£)</Label>
            <Input type="number" placeholder="499" min="0" value={form.msrp} onChange={(e) => set("msrp", e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <textarea
            rows={3}
            placeholder="Optional description..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Add Product
        </Button>
      </form>
    </div>
  );
}
