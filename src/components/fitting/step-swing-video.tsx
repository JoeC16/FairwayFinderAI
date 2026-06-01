"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, CheckCircle, X, Brain, AlertCircle, Zap, TrendingUp, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { resizeImage } from "@/lib/resize-image";
import type { SwingAnalysis } from "@/lib/ai/swing-analyser";

interface Props {
  sessionId: string;
  onComplete: () => void;
  onSkip: () => void;
}

const VIEW_LABELS = [
  { key: "address", label: "Address / Setup", hint: "Standing at address, face-on to camera" },
  { key: "backswing", label: "Top of Backswing", hint: "At the top, face-on or down-the-line" },
  { key: "impact", label: "Impact", hint: "Contact position, face-on" },
  { key: "follow", label: "Follow Through", hint: "Finish position, any angle" },
];

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 8 ? "bg-green-100 text-green-700" : score >= 6 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  return <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", color)}>{score}/10</span>;
}

function SeverityDot({ severity }: { severity: string }) {
  const color = severity === "minor" ? "bg-amber-400" : severity === "moderate" ? "bg-orange-500" : "bg-red-500";
  return <span className={cn("inline-block h-2 w-2 rounded-full shrink-0 mt-1.5", color)} />;
}

export function StepSwingVideo({ sessionId, onComplete, onSkip }: Props) {
  const [images, setImages] = useState<Array<{ key: string; dataUrl: string; name: string }>>([]);
  const [analysing, setAnalysing] = useState(false);
  const [analysis, setAnalysis] = useState<SwingAnalysis | null>(null);
  const [error, setError] = useState("");

  const handleFileSelect = useCallback(async (key: string, file: File) => {
    const dataUrl = await resizeImage(file, 1024, 0.85);
    setImages((prev) => {
      const filtered = prev.filter((img) => img.key !== key);
      return [...filtered, { key, dataUrl, name: file.name }];
    });
  }, []);

  const removeImage = useCallback((key: string) => {
    setImages((prev) => prev.filter((img) => img.key !== key));
  }, []);

  async function handleAnalyse() {
    if (images.length === 0) return;
    setAnalysing(true);
    setError("");

    try {
      const endpoint = sessionId
        ? `/api/fitting/${sessionId}/swing-analysis`
        : "/api/swing-analysis";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ images: images.map((i) => i.dataUrl) }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Analysis failed");
      }

      const data = await res.json() as { analysis: SwingAnalysis };
      setAnalysis(data.analysis);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAnalysing(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header info */}
      <div className="bg-brand-50 rounded-2xl border border-brand-100 p-4 flex items-start gap-3">
        <Brain className="h-5 w-5 text-brand-700 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-brand-900">AI Swing Analysis — Live</p>
          <p className="text-xs text-brand-700 mt-0.5">
            Upload 1–4 photos of your swing. Claude AI will analyse your mechanics and refine your club recommendations.
          </p>
        </div>
      </div>

      {/* Image upload slots */}
      {!analysis && (
        <div className="grid grid-cols-2 gap-3">
          {VIEW_LABELS.map(({ key, label, hint }) => {
            const existing = images.find((i) => i.key === key);
            return (
              <div
                key={key}
                className={cn(
                  "relative rounded-2xl border-2 border-dashed p-4 text-center transition-all",
                  existing
                    ? "border-brand-400 bg-brand-50"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                )}
              >
                {existing ? (
                  <>
                    <img
                      src={existing.dataUrl}
                      alt={label}
                      className="w-full h-24 object-cover rounded-xl mb-2"
                    />
                    <p className="text-xs font-medium text-brand-700">{label}</p>
                    <button
                      onClick={() => removeImage(key)}
                      className="absolute top-2 right-2 h-5 w-5 bg-white rounded-full flex items-center justify-center shadow text-gray-400 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer block">
                    <Camera className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-gray-700">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{hint}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium">
                      <Camera className="h-3 w-3" />
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
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-4 animate-fade-in">
          {/* Overall */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Brain className="h-4 w-4 text-brand-600" />
                AI Assessment
              </h3>
              <span className="text-xs font-medium text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded-full">
                {analysis.swingType} swing
              </span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{analysis.overall}</p>

            {/* Score grid */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {Object.entries(analysis.scores).map(([k, v]) => (
                <div key={k} className="text-center">
                  <ScoreBadge score={v} />
                  <p className="text-xs text-gray-400 mt-1 capitalize">{k === "followThrough" ? "Follow" : k}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          {analysis.strengths.length > 0 && (
            <div className="bg-green-50 rounded-2xl border border-green-100 p-4">
              <h4 className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                Strengths
              </h4>
              <ul className="space-y-1">
                {analysis.strengths.map((s, i) => (
                  <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Faults */}
          {analysis.faults.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-600" />
                Areas to Work On
              </h4>
              <div className="space-y-3">
                {analysis.faults.map((fault, i) => (
                  <div key={i} className="flex gap-2.5">
                    <SeverityDot severity={fault.severity} />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{fault.area}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{fault.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Equipment implications */}
          <div className="bg-gold-50 rounded-2xl border border-gold-200 p-4">
            <h4 className="text-sm font-semibold text-gold-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gold-600" />
              Equipment Implications
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="font-medium text-gold-800 w-24 shrink-0">Shaft flex:</span>
                <span className="text-gold-700">{analysis.equipmentImplications.shaftFlex}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gold-800 w-24 shrink-0">Loft:</span>
                <span className="text-gold-700">{analysis.equipmentImplications.loftAdjustment}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gold-800 w-24 shrink-0">Head type:</span>
                <span className="text-gold-700">{analysis.equipmentImplications.clubheadType}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-gold-200">
                <p className="text-gold-800 italic text-xs">{analysis.equipmentImplications.summary}</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-center text-gray-400">
            These insights have been added to your fitting session.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!analysis ? (
          <>
            <Button variant="outline" className="flex-1" onClick={onSkip} disabled={analysing}>
              Skip & Generate Report
            </Button>
            <Button
              className="flex-1"
              variant="gold"
              onClick={handleAnalyse}
              disabled={images.length === 0 || analysing}
            >
              {analysing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analysing...
                </>
              ) : (
                <>
                  Analyse My Swing
                  <Zap className="h-4 w-4" />
                </>
              )}
            </Button>
          </>
        ) : (
          <Button className="w-full" variant="gold" onClick={onComplete}>
            Generate My Report
            <Zap className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
