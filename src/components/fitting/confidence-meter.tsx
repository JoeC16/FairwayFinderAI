"use client";

import { cn, getConfidenceTier, getConfidenceTierColor } from "@/lib/utils";

interface Props {
  score: number;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const SIZES = {
  sm: { r: 20, stroke: 4, text: "text-sm", outer: "w-14 h-14" },
  md: { r: 28, stroke: 5, text: "text-base", outer: "w-20 h-20" },
  lg: { r: 40, stroke: 6, text: "text-xl", outer: "w-28 h-28" },
};

export function ConfidenceMeter({ score, size = "md", showLabel = false, className }: Props) {
  const { r, stroke, text, outer } = SIZES[size];
  const cx = r + stroke;
  const cy = r + stroke;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (score / 100) * circumference;
  const tier = getConfidenceTier(score);
  const color = getConfidenceTierColor(tier);

  const strokeColor =
    score >= 90 ? "#22c55e" :
    score >= 75 ? "#10b981" :
    score >= 60 ? "#f59e0b" :
    score >= 40 ? "#f97316" : "#ef4444";

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <div className={cn("relative", outer)}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${(r + stroke) * 2} ${(r + stroke) * 2}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            className="text-gray-100"
          />
          {/* Progress circle */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={strokeColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="confidence-ring transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn("font-bold", text, color)}>{score}%</span>
        </div>
      </div>
      {showLabel && (
        <span className={cn("text-xs font-medium", color)}>
          {score >= 90 ? "Very High" :
           score >= 75 ? "High" :
           score >= 60 ? "Moderate" :
           score >= 40 ? "Low" : "Insufficient"}
        </span>
      )}
    </div>
  );
}
