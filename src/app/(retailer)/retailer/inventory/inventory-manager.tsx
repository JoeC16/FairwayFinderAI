"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Package, Upload, Trash2, Search, AlertCircle, Loader2 } from "lucide-react";
import type { RetailerInventoryItem } from "@prisma/client";

interface Props {
  retailerId: string;
  initialItems: RetailerInventoryItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
  DRIVER: "Driver", FAIRWAY_WOOD: "Fairway Wood", HYBRID: "Hybrid",
  IRON_SET: "Irons", INDIVIDUAL_IRON: "Iron", WEDGE: "Wedge",
  PUTTER: "Putter", SHAFT: "Shaft", GRIP: "Grip",
};

export function InventoryManager({ retailerId, initialItems }: Props) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`/api/retailers/${retailerId}/inventory`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Upload failed");
      }
      const result = await res.json() as { items?: RetailerInventoryItem[] };
      if (result.items) setItems((prev) => [...result.items!, ...prev]);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function deleteItem(id: string) {
    await fetch(`/api/retailers/${retailerId}/inventory`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: [id] }),
    });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  const filtered = items.filter(
    (item) =>
      !search ||
      `${item.brand} ${item.model} ${item.sku}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">{items.length} items</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleCSV} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Import CSV
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-sm text-blue-700">
          <strong>CSV format:</strong> sku, brand, model, category (DRIVER/IRON_SET/WEDGE etc.), loft, shaft, flex, price, stock_qty, product_url
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search brand, model, or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="h-10 w-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-400 mb-2">
              {search ? "No items match your search." : "No inventory yet."}
            </p>
            {!search && (
              <p className="text-sm text-gray-400">Import a CSV to add your stock and enable inventory matching in fitting reports.</p>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-50 text-left">
                <th className="px-5 py-3 font-medium text-gray-500">Product</th>
                <th className="px-5 py-3 font-medium text-gray-500">Category</th>
                <th className="px-5 py-3 font-medium text-gray-500">Specs</th>
                <th className="px-5 py-3 font-medium text-gray-500">Price</th>
                <th className="px-5 py-3 font-medium text-gray-500">Stock</th>
                <th className="px-5 py-3 font-medium text-gray-500">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{item.brand} {item.model}</p>
                    <p className="text-xs text-gray-400">{item.sku}</p>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="secondary" className="text-xs">
                      {CATEGORY_LABELS[item.category] ?? item.category}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-gray-500 text-xs">
                    {[item.loft && `${item.loft}°`, item.flex].filter(Boolean).join(" · ") || "—"}
                  </td>
                  <td className="px-5 py-3 font-medium text-gray-900">${item.price}</td>
                  <td className="px-5 py-3 text-gray-500">{item.stockQty}</td>
                  <td className="px-5 py-3">
                    <Badge variant={item.available ? "success" : "secondary"} className="text-xs">
                      {item.available ? "Available" : "Unavailable"}
                    </Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => deleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
