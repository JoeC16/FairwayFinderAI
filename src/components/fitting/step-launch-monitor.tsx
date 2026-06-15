"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/lib/hooks/use-toast";
import { parseTrackManCSV } from "@/lib/trackman-parser";
import type { TrackManParseResult } from "@/lib/trackman-parser";
import { Loader2, ChevronRight, Zap, Upload, CheckCircle2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  sessionId: string;
  onComplete: () => void;
  onSkip: () => void;
}

const MONITOR_TYPES = [
  { value: "trackman", label: "TrackMan" },
  { value: "gcquad", label: "GCQuad" },
  { value: "flightscope", label: "Flightscope" },
  { value: "skytrak", label: "SkyTrak" },
  { value: "uneekor", label: "Uneekor" },
  { value: "other", label: "Other" },
];

interface DataFields {
  [key: string]: string;
}

const DRIVER_FIELDS = [
  { key: "clubSpeed", label: "Club Speed", unit: "mph", placeholder: "95" },
  { key: "ballSpeed", label: "Ball Speed", unit: "mph", placeholder: "142" },
  { key: "smashFactor", label: "Smash Factor", unit: "", placeholder: "1.49" },
  { key: "launchAngle", label: "Launch Angle", unit: "°", placeholder: "12.5" },
  { key: "spinRate", label: "Spin Rate", unit: "rpm", placeholder: "2400" },
  { key: "carryDistance", label: "Carry Distance", unit: "yds", placeholder: "248" },
  { key: "totalDistance", label: "Total Distance", unit: "yds", placeholder: "265" },
  { key: "attackAngle", label: "Attack Angle", unit: "°", placeholder: "-2.5" },
  { key: "clubPath", label: "Club Path", unit: "°", placeholder: "1.2" },
  { key: "faceAngle", label: "Face Angle", unit: "°", placeholder: "0.8" },
  { key: "dynamicLoft", label: "Dynamic Loft", unit: "°", placeholder: "14.5" },
  { key: "apex", label: "Apex Height", unit: "yds", placeholder: "34" },
  { key: "descentAngle", label: "Descent Angle", unit: "°", placeholder: "38" },
];

const IRON_FIELDS = [
  { key: "clubSpeed", label: "Club Speed", unit: "mph", placeholder: "80" },
  { key: "ballSpeed", label: "Ball Speed", unit: "mph", placeholder: "114" },
  { key: "launchAngle", label: "Launch Angle", unit: "°", placeholder: "18" },
  { key: "spinRate", label: "Spin Rate", unit: "rpm", placeholder: "6800" },
  { key: "carryDistance", label: "Carry Distance", unit: "yds", placeholder: "167" },
  { key: "peakHeight", label: "Peak Height", unit: "yds", placeholder: "28" },
  { key: "descentAngle", label: "Descent Angle", unit: "°", placeholder: "48" },
];

function DataGrid({
  fields,
  data,
  onChange,
}: {
  fields: typeof DRIVER_FIELDS;
  data: DataFields;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {fields.map(({ key, label, unit, placeholder }) => (
        <div key={key} className="space-y-1.5">
          <label className="text-xs font-medium text-gray-600">
            {label} {unit && <span className="text-gray-400">({unit})</span>}
          </label>
          <div className="relative">
            <Input
              type="number"
              step="0.1"
              placeholder={placeholder}
              className="h-9 text-sm"
              value={data[key] ?? ""}
              onChange={(e) => onChange(key, e.target.value)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function StepLaunchMonitor({ sessionId, onComplete, onSkip }: Props) {
  const [monitorType, setMonitorType] = useState<string>("");
  const [driverData, setDriverData] = useState<DataFields>({});
  const [ironData, setIronData] = useState<DataFields>({});
  const [loading, setLoading] = useState(false);
  const [importPreview, setImportPreview] = useState<TrackManParseResult | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasAnyData =
    Object.values(driverData).some((v) => v) ||
    Object.values(ironData).some((v) => v);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const result = parseTrackManCSV(text);
      if (!result.isTrackMan) {
        toast({ title: "Unrecognised file", description: "This doesn't look like a TrackMan CSV export. Make sure you export from TrackMan Performance Studio.", variant: "destructive" });
      } else if (!result.driverData && !result.ironData) {
        toast({ title: "No data found", description: "The file was recognised but contained no Driver or 7-Iron shots.", variant: "destructive" });
      } else {
        setImportPreview(result);
        if (!monitorType) setMonitorType("trackman");
      }
      setImporting(false);
      // Reset input so the same file can be re-uploaded
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  }

  function applyImport() {
    if (!importPreview) return;
    if (importPreview.driverData) {
      const fields: DataFields = {};
      for (const [k, v] of Object.entries(importPreview.driverData)) {
        if (v !== undefined) fields[k] = String(v);
      }
      setDriverData(fields);
    }
    if (importPreview.ironData) {
      const fields: DataFields = {};
      for (const [k, v] of Object.entries(importPreview.ironData)) {
        if (v !== undefined && k !== "club") fields[k] = String(v);
      }
      setIronData(fields);
    }
    setImportPreview(null);
    toast({ title: "Data imported", description: "Review the values below and save when ready." });
  }

  async function handleSave() {
    if (!hasAnyData) {
      onSkip();
      return;
    }

    setLoading(true);
    try {
      const parseFields = (fields: typeof DRIVER_FIELDS, data: DataFields) => {
        const result: Record<string, number> = {};
        for (const { key } of fields) {
          if (data[key] && data[key] !== "") {
            result[key] = parseFloat(data[key]);
          }
        }
        return Object.keys(result).length ? result : undefined;
      };

      const payload = {
        monitorType: monitorType || undefined,
        driverData: parseFields(DRIVER_FIELDS, driverData),
        ironData: parseFields(IRON_FIELDS, ironData),
      };

      const res = await fetch(`/api/fitting/${sessionId}/launch-monitor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save launch monitor data");
      onComplete();
    } catch (err) {
      toast({ title: "Error", description: (err as Error).message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-brand-50 rounded-2xl border border-brand-100 p-4 flex items-start gap-3">
        <Zap className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-brand-900">Launch monitor data boosts confidence by up to 30%</p>
          <p className="text-xs text-brand-700 mt-0.5">Even partial data (just club speed) dramatically improves recommendation accuracy. Skip if you don&apos;t have access.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <Label className="text-sm font-semibold">Launch Monitor Device</Label>
        <Select value={monitorType} onValueChange={setMonitorType}>
          <SelectTrigger>
            <SelectValue placeholder="Select your launch monitor (optional)" />
          </SelectTrigger>
          <SelectContent>
            {MONITOR_TYPES.map((m) => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* TrackMan CSV import */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-medium text-gray-700 mb-2">Have a TrackMan session? Import it directly</p>
          <p className="text-xs text-gray-400 mb-3">
            In TrackMan Performance Studio: open your session → <strong>Export</strong> → <strong>CSV</strong>. Upload that file here and we&apos;ll fill in all the fields automatically.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="gap-2"
          >
            {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
            {importing ? "Reading file…" : "Import TrackMan CSV"}
          </Button>
        </div>
      </div>

      {/* Import preview */}
      {importPreview && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-900">TrackMan data detected</p>
                <p className="text-xs text-green-700">
                  {[
                    importPreview.driverShotCount > 0 && `${importPreview.driverShotCount} driver shot${importPreview.driverShotCount !== 1 ? "s" : ""}`,
                    importPreview.ironShotCount > 0 && `${importPreview.ironShotCount} 7-iron shot${importPreview.ironShotCount !== 1 ? "s" : ""}`,
                  ].filter(Boolean).join(" · ")} · averaged
                </p>
              </div>
            </div>
            <button onClick={() => setImportPreview(null)} className="text-green-500 hover:text-green-700">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            {importPreview.driverData && (
              <div>
                <p className="font-semibold text-green-800 mb-1.5">Driver</p>
                <div className="space-y-1">
                  {Object.entries(importPreview.driverData).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-green-700">
                      <span className="text-green-600 capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {importPreview.ironData && (
              <div>
                <p className="font-semibold text-green-800 mb-1.5">7-Iron</p>
                <div className="space-y-1">
                  {Object.entries(importPreview.ironData).filter(([k]) => k !== "club").map(([k, v]) => (
                    <div key={k} className="flex justify-between text-green-700">
                      <span className="text-green-600 capitalize">{k.replace(/([A-Z])/g, " $1")}</span>
                      <span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button size="sm" onClick={applyImport} className={cn("w-full gap-2")}>
            <CheckCircle2 className="h-4 w-4" />
            Apply this data
          </Button>
        </div>
      )}

      <Tabs defaultValue="driver" className="space-y-4">
        <TabsList className="w-full">
          <TabsTrigger value="driver" className="flex-1">Driver Data</TabsTrigger>
          <TabsTrigger value="iron" className="flex-1">Iron Data (7-iron)</TabsTrigger>
        </TabsList>

        <TabsContent value="driver">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Driver Launch Monitor Data</h3>
            <DataGrid
              fields={DRIVER_FIELDS}
              data={driverData}
              onChange={(k, v) => setDriverData((prev) => ({ ...prev, [k]: v }))}
            />
          </div>
        </TabsContent>

        <TabsContent value="iron">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">7-Iron Launch Monitor Data</h3>
            <DataGrid
              fields={IRON_FIELDS}
              data={ironData}
              onChange={(k, v) => setIronData((prev) => ({ ...prev, [k]: v }))}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onSkip}>
          Skip — No launch data
        </Button>
        <Button className="flex-1" onClick={handleSave} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>
            {!hasAnyData ? "Skip" : "Save & Continue"}
            <ChevronRight className="h-4 w-4" />
          </>}
        </Button>
      </div>
    </div>
  );
}
