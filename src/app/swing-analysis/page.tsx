"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Brain, Camera, X, CheckCircle, Target, TrendingUp,
  Loader2, AlertCircle, ArrowRight, Zap, ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { resizeImage } from "@/lib/resize-image";
import type { SwingAnalysis } from "@/lib/ai/swing-analyser";

const VIEW_LABELS = [
  { key: "address", label: "Address / Setup", hint: "Face-on, standing at address" },
  { key: "backswing", label: "Top of Backswing", hint: "At the top, face-on or down-the-line" },
  { key: "impact", label: "Impact", hint: "Contact position, face-on" },
  { key: "follow", label: "Follow Through", hint: "Finish position, any angle" },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? "bg-green-100 text-green-700" : score >= 6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return <span className={cn("inline-flex items-center justify-center text-sm font-bold px-3 py-1 rounded-full", color)}>{score}/10</span>;
}

export default function SwingAnalysisPage() {
  const [images, setImages] = useState<Array<{ key: string; dataUrl: string }>>([]);
  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null);
  const [error, setError] = useState("");

  const handleFileSelect = useCallback(async (key: string, file: File) => {
    const dataUrl = await resizeImage(file, 1024, 0.85);
    setImages((prev) => [...prev.filter((i) => i.key !== key), { key, dataUrl }]);
  }, []);

  const removeImage = useCallback((key: string) => {
    setImages((prev) => prev.filter((i) => i.key !== key));
  }, []);

  async function handleAnalyse() {
    if (!images.length) return;
    setAnalysing(true);
    setError("");
    try {
      const res = await fetch("/api/swing-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: images.map((i) => i.dataUrl) }),
      });
      if (!res.ok) {
        const d = await res.json() as { error?: string };
        throw new Error(d.error ?? "Analysis failed");
      }
      const { analysis } = await res.json() as { analysis: SwingAnalysis };
      setAnalysis(analysis);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAnalysing(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="gradient-hero px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <Link href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Brain className="h-6 w-6 text-gold-400" />
            <span className="text-gold-400 text-sm font-semibold uppercase tracking-wider">AI Powered</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Swing Analyser</h1>
          <p className="text-white/70 mt-2 max-w-lg">
            Upload up to 4 photos of your swing. Claude AI analyses your mechanics and tells you exactly what equipment you need.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-6">
        {/* Upload grid */}
        {!analysis && (
          <>
            <div className="grid grid-cols-2 gap-4">
              {VIEW_LABELS.map(({ key, label, hint }) => {
                const existing = images.find((i) => i.key === key);
                return (
                  <div
                    key={key}
                    className={cn(
                      "relative rounded-2xl border-2 border-dashed p-5 text-center transition-all bg-white",
                      existing ? "border-brand-400 bg-brand-50" : "border-gray-200 hover:border-gray-300"
                    )}
                  >
                    {existing ? (
                      <>
                        <img src={existing.dataUrl} alt={label} className="w-full h-32 object-cover rounded-xl mb-2" />
                        <p className="text-sm font-semibold text-brand-700">{label}</p>
                        <button
                          onClick={() => removeImage(key)}
                          className="absolute top-2 right-2 h-6 w-6 bg-white rounded-full flex items-center justify-center shadow text-gray-400 hover:text-red-500"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </>
                    ) : (
                      <label className="cursor-pointer block">
                        <Camera className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-gray-700">{label}</p>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">{hint}</p>
                        <span className="mt-4 inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-900 text-white text-xs font-medium">
                          <Camera className="h-3.5 w-3.5" />
                          Add Photo
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileSelect(key, file);
                            e.target.value = "";
                          }}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              className="w-full"
              variant="gold"
              size="lg"
              onClick={handleAnalyse}
              disabled={images.length === 0 || analysing}
            >
              {analysing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Claude is analysing your swing...
                </>
              ) : (
                <>
                  <Brain className="h-5 w-5" />
                  Analyse My Swing
                </>
              )}
            </Button>

            <p className="text-center text-xs text-gray-400">
              One photo is enough. More photos = more accurate analysis. Images are not stored.
            </p>
          </>
        )}

        {/* Results */}
        {analysis && (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-brand-600" />
                  Your Swing Analysis
                </h2>
                <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full capitalize">
                  {analysis.swingType} swing
                </span>
              </div>
              <p className="text-gray-700 leading-relaxed">{analysis.overall}</p>

              {/* Scores */}
              <div className="mt-5 grid grid-cols-4 gap-3">
                {Object.entries(analysis.scores).map(([k, v]) => (
                  <div key={k} className="text-center">
                    <ScoreBadge score={v} />
                    <p className="text-xs text-gray-400 mt-1.5 capitalize">
                      {k === "followThrough" ? "Follow" : k}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths */}
            {analysis.strengths.length > 0 && (
              <div className="bg-green-50 rounded-2xl border border-green-100 p-5">
                <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  Strengths
                </h3>
                <ul className="space-y-1.5">
                  {analysis.strengths.map((s, i) => (
                    <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="text-green-500 mt-0.5 shrink-0">•</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Faults */}
            {analysis.faults.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="h-4 w-4 text-amber-600" />
                  Areas to Work On
                </h3>
                <div className="space-y-4">
                  {analysis.faults.map((fault, i) => (
                    <div key={i} className="flex gap-3">
                      <span className={cn(
                        "inline-block h-2 w-2 rounded-full shrink-0 mt-1.5",
                        fault.severity === "minor" ? "bg-amber-400" :
                        fault.severity === "moderate" ? "bg-orange-500" : "bg-red-500"
                      )} />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-800">{fault.area}</p>
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded capitalize",
                            fault.severity === "minor" ? "bg-amber-100 text-amber-700" :
                            fault.severity === "moderate" ? "bg-orange-100 text-orange-700" : "bg-red-100 text-red-700"
                          )}>
                            {fault.severity}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5 leading-relaxed">{fault.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment implications */}
            <div className="bg-gold-50 rounded-2xl border border-gold-200 p-5">
              <h3 className="font-semibold text-gold-900 mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-gold-600" />
                Equipment Implications
              </h3>
              <div className="space-y-3 text-sm">
                {[
                  ["Shaft flex", analysis.equipmentImplications.shaftFlex],
                  ["Loft", analysis.equipmentImplications.loftAdjustment],
                  ["Club head", analysis.equipmentImplications.clubheadType],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-3">
                    <span className="font-semibold text-gold-800 w-20 shrink-0">{label}</span>
                    <span className="text-gold-700">{value}</span>
                  </div>
                ))}
                <div className="pt-3 mt-1 border-t border-gold-200">
                  <p className="text-gold-800 italic text-sm">{analysis.equipmentImplications.summary}</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="gradient-hero rounded-2xl p-6 text-center">
              <h3 className="text-lg font-bold text-white mb-2">Get Your Full Club Fitting</h3>
              <p className="text-white/70 text-sm mb-4">
                Take a full 6-step fitting session and get personalised driver, iron, wedge and shaft recommendations.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="gold" size="lg" asChild>
                  <Link href="/fitting/new">
                    Start Full Fitting
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="hero" size="sm" onClick={() => { setAnalysis(null); setImages([]); }}>
                  <Zap className="h-4 w-4" />
                  Analyse Another Swing
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
