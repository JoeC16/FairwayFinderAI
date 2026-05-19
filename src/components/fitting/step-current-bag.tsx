"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/lib/hooks/use-toast";
import { Loader2, ChevronRight, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

type ClubCategory = "driver" | "fairway_wood" | "hybrid" | "driving_iron" | "iron_set" | "wedge" | "putter";
type ShaftFlex = "ladies" | "senior" | "regular" | "stiff" | "x_stiff";

interface Club {
  id: string;
  category: ClubCategory;
  brand: string;
  model: string;
  loft: string;
  shaft: string;
  flex: ShaftFlex | "";
}

const DEFAULT_CLUBS: Omit<Club, "id">[] = [
  { category: "driver", brand: "", model: "", loft: "", shaft: "", flex: "" },
  { category: "iron_set", brand: "", model: "", loft: "", shaft: "", flex: "" },
  { category: "wedge", brand: "", model: "", loft: "52", shaft: "", flex: "" },
  { category: "wedge", brand: "", model: "", loft: "56", shaft: "", flex: "" },
  { category: "putter", brand: "", model: "", loft: "", shaft: "", flex: "" },
];

const CATEGORY_LABELS: Record<ClubCategory, string> = {
  driver: "Driver",
  fairway_wood: "Fairway Wood",
  hybrid: "Hybrid",
  driving_iron: "Driving Iron",
  iron_set: "Iron Set",
  wedge: "Wedge",
  putter: "Putter",
};

const POPULAR_BRANDS = ["TaylorMade", "Callaway", "Titleist", "Ping", "Mizuno", "Cobra", "Cleveland", "Srixon", "Wilson", "Bridgestone", "Other"];
const FLEX_OPTIONS: ShaftFlex[] = ["ladies", "senior", "regular", "stiff", "x_stiff"];
const FLEX_LABELS: Record<ShaftFlex, string> = {
  ladies: "Ladies (L)",
  senior: "Senior (A)",
  regular: "Regular (R)",
  stiff: "Stiff (S)",
  x_stiff: "X-Stiff (X)",
};

interface Props {
  sessionId: string;
  onComplete: () => void;
  onSkip: () => void;
}

export function StepCurrentBag({ sessionId, onComplete, onSkip }: Props) {
  const [clubs, setClubs] = useState<Club[]>(() =>
    DEFAULT_CLUBS.map((c) => ({ ...c, id: Math.random().toString(36).slice(2) }))
  );
  const [loading, setLoading] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set([clubs[0].id]));

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function updateClub(id: string, field: keyof Club, value: string) {
    setClubs((prev) => prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)));
  }

  function addClub(category: ClubCategory) {
    const newClub: Club = {
      id: Math.random().toString(36).slice(2),
      category,
      brand: "",
      model: "",
      loft: "",
      shaft: "",
      flex: "",
    };
    setClubs((prev) => [...prev, newClub]);
    setExpandedIds((prev) => new Set([...prev, newClub.id]));
  }

  function removeClub(id: string) {
    setClubs((prev) => prev.filter((c) => c.id !== id));
  }

  async function handleSave() {
    setLoading(true);
    try {
      const filledClubs = clubs
        .filter((c) => c.brand || c.model || c.loft)
        .map(({ id: _, flex, loft, ...rest }) => ({
          ...rest,
          flex: flex || undefined,
          loft: loft ? parseFloat(loft) : undefined,
        }));

      const res = await fetch(`/api/fitting/${sessionId}/bag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clubs: filledClubs }),
      });

      if (!res.ok) throw new Error("Failed to save bag");
      onComplete();
    } catch (err) {
      toast({
        title: "Error saving bag",
        description: (err as Error).message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const addableCategories: ClubCategory[] = ["fairway_wood", "hybrid", "driving_iron", "wedge"];

  return (
    <div className="space-y-4">
      {clubs.map((club) => {
        const isExpanded = expandedIds.has(club.id);
        const hasContent = club.brand || club.model;

        return (
          <div key={club.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <button
              type="button"
              onClick={() => toggleExpand(club.id)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  hasContent ? "bg-brand-500" : "bg-gray-200"
                )} />
                <span className="font-medium text-gray-900">{CATEGORY_LABELS[club.category]}</span>
                {hasContent && (
                  <span className="text-sm text-gray-500">
                    {[club.brand, club.model, club.loft && `${club.loft}°`].filter(Boolean).join(" ")}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {clubs.filter((c) => c.category === club.category).length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeClub(club.id); }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
              </div>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5 border-t border-gray-50 pt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Brand</Label>
                  <Select value={club.brand} onValueChange={(v) => updateClub(club.id, "brand", v)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select brand" />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_BRANDS.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Model</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="e.g. G440 Max"
                    value={club.model}
                    onChange={(e) => updateClub(club.id, "model", e.target.value)}
                  />
                </div>
                {club.category !== "putter" && (
                  <div className="space-y-1.5">
                    <Label className="text-xs">Loft</Label>
                    <Input
                      className="h-9 text-sm"
                      placeholder="e.g. 10.5"
                      type="number"
                      step="0.5"
                      value={club.loft}
                      onChange={(e) => updateClub(club.id, "loft", e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label className="text-xs">Shaft</Label>
                  <Input
                    className="h-9 text-sm"
                    placeholder="e.g. Ventus Blue"
                    value={club.shaft}
                    onChange={(e) => updateClub(club.id, "shaft", e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Flex</Label>
                  <Select value={club.flex} onValueChange={(v) => updateClub(club.id, "flex", v as ShaftFlex)}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Select flex" />
                    </SelectTrigger>
                    <SelectContent>
                      {FLEX_OPTIONS.map((f) => <SelectItem key={f} value={f}>{FLEX_LABELS[f]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add more clubs */}
      <div className="flex flex-wrap gap-2">
        {addableCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => addClub(cat)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button variant="outline" className="flex-1" onClick={onSkip}>
          Skip — Building from scratch
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
            Save & Continue
            <ChevronRight className="h-4 w-4" />
          </>}
        </Button>
      </div>
    </div>
  );
}
