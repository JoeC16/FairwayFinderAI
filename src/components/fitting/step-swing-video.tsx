"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Video, Upload, CheckCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  sessionId: string;
  onComplete: () => void;
  onSkip: () => void;
}

type VideoView = "FACE_ON" | "DOWN_THE_LINE";

interface VideoState {
  file: File | null;
  uploading: boolean;
  uploaded: boolean;
}

export function StepSwingVideo({ sessionId, onComplete, onSkip }: Props) {
  const [videos, setVideos] = useState<Record<VideoView, VideoState>>({
    FACE_ON: { file: null, uploading: false, uploaded: false },
    DOWN_THE_LINE: { file: null, uploading: false, uploaded: false },
  });
  const [isAnalysing, setIsAnalysing] = useState(false);

  async function handleFileSelect(view: VideoView, file: File) {
    setVideos((prev) => ({ ...prev, [view]: { file, uploading: true, uploaded: false } }));

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("view", view);

      const res = await fetch(`/api/fitting/${sessionId}/video`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      setVideos((prev) => ({ ...prev, [view]: { file, uploading: false, uploaded: true } }));
    } catch {
      setVideos((prev) => ({ ...prev, [view]: { file: null, uploading: false, uploaded: false } }));
    }
  }

  const hasVideos = videos.FACE_ON.uploaded || videos.DOWN_THE_LINE.uploaded;

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4 flex items-start gap-3">
        <Video className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-900">AI Swing Analysis Coming Soon</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Upload your swing videos now and they&apos;ll be analysed when our AI video engine launches. Your data is stored securely.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {(["FACE_ON", "DOWN_THE_LINE"] as VideoView[]).map((view) => {
          const state = videos[view];
          const label = view === "FACE_ON" ? "Face-On View" : "Down-the-Line View";
          const hint = view === "FACE_ON"
            ? "Camera facing your chest, perpendicular to target line"
            : "Camera behind you, pointing down the target line";

          return (
            <div
              key={view}
              className={cn(
                "rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
                state.uploaded
                  ? "border-green-300 bg-green-50"
                  : state.uploading
                  ? "border-brand-300 bg-brand-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              )}
            >
              <div className="flex justify-center mb-3">
                {state.uploaded ? (
                  <CheckCircle className="h-10 w-10 text-green-500" />
                ) : state.uploading ? (
                  <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
                ) : (
                  <Video className="h-10 w-10 text-gray-300" />
                )}
              </div>

              <h3 className="font-semibold text-gray-900 text-sm">{label}</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">{hint}</p>

              {state.uploaded ? (
                <p className="mt-3 text-xs text-green-600 font-medium">
                  ✓ {state.file?.name}
                </p>
              ) : !state.uploading && (
                <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-medium cursor-pointer hover:bg-gray-800 transition-colors">
                  <Upload className="h-3.5 w-3.5" />
                  Choose Video
                  <input
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(view, file);
                    }}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-gray-50 rounded-2xl p-5 space-y-3">
        <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Zap className="h-4 w-4 text-gold-600" />
          Future AI Swing Analysis Will Detect:
        </h4>
        <div className="grid sm:grid-cols-2 gap-2">
          {[
            "Club path and swing plane",
            "Early extension",
            "Casting / over-the-top",
            "Posture analysis",
            "Release pattern",
            "Strike location prediction",
          ].map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-sm text-gray-600">
              <div className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              {feature}
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={onSkip} disabled={isAnalysing}>
          Skip & Generate Report
        </Button>
        <Button
          className="flex-1"
          variant="gold"
          onClick={onComplete}
          disabled={isAnalysing}
        >
          {isAnalysing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analysing...
            </>
          ) : (
            <>
              {hasVideos ? "Submit & Analyse" : "Generate My Report"}
              <Zap className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
