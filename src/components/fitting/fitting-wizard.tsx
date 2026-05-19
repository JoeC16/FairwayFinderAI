"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { StepPlayerProfile } from "./step-player-profile";
import { StepCurrentBag } from "./step-current-bag";
import { StepShotTendencies } from "./step-shot-tendencies";
import { StepDistanceMatrix } from "./step-distance-matrix";
import { StepLaunchMonitor } from "./step-launch-monitor";
import { StepSwingVideo } from "./step-swing-video";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/lib/hooks/use-toast";
import {
  User,
  Briefcase,
  Target,
  BarChart3,
  Zap,
  Video,
  Check,
  ChevronLeft,
  Loader2,
} from "lucide-react";

const STEPS = [
  { id: 1, label: "Profile", icon: User, description: "Tell us about yourself" },
  { id: 2, label: "Your Bag", icon: Briefcase, description: "Current equipment" },
  { id: 3, label: "Tendencies", icon: Target, description: "Shot characteristics" },
  { id: 4, label: "Distances", icon: BarChart3, description: "Carry distances" },
  { id: 5, label: "Launch Data", icon: Zap, description: "Monitor metrics" },
  { id: 6, label: "Video", icon: Video, description: "Swing footage" },
];

interface Props {
  sessionId: string;
}

export function FittingWizard({ sessionId }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isAnalysing, setIsAnalysing] = useState(false);

  const markStepComplete = useCallback((step: number) => {
    setCompletedSteps((prev) => new Set([...prev, step]));
  }, []);

  const goToStep = useCallback((step: number) => {
    if (step >= 1 && step <= STEPS.length) {
      setCurrentStep(step);
    }
  }, []);

  const handleNext = useCallback(() => {
    markStepComplete(currentStep);
    if (currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, markStepComplete]);

  const handleSkip = useCallback(() => {
    if (currentStep < STEPS.length) {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep]);

  const handleAnalyse = useCallback(async () => {
    setIsAnalysing(true);
    try {
      const token = sessionStorage.getItem(`fitting_token_${sessionId}`);
      const res = await fetch(`/api/fitting/${sessionId}/analyze`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "X-Guest-Token": token } : {}),
        },
      });

      if (!res.ok) {
        const err = await res.json() as { error?: string };
        throw new Error(err.error ?? "Analysis failed");
      }

      router.push(`/fitting/${sessionId}/results`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Analysis failed",
        description: (err as Error).message ?? "Please try again.",
        variant: "destructive",
      });
      setIsAnalysing(false);
    }
  }, [sessionId, router]);

  const progress = ((currentStep - 1) / (STEPS.length - 1)) * 100;
  const isLastStep = currentStep === STEPS.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-brand-900 px-4 py-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-500">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 text-white">
                  <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                  <path d="M12 2v20M3 7l9 5 9-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-white font-bold">FairwayFit AI</span>
            </div>
            <span className="text-white/60 text-sm">
              Step {currentStep} of {STEPS.length}
            </span>
          </div>

          <Progress value={progress} className="h-1.5 bg-white/20 [&>div]:bg-gold-500" />

          {/* Step pills */}
          <div className="mt-4 hidden sm:flex items-center gap-1 overflow-x-auto no-scrollbar">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isComplete = completedSteps.has(step.id);
              const isActive = currentStep === step.id;
              const isPast = step.id < currentStep;

              return (
                <button
                  key={step.id}
                  onClick={() => (isComplete || isPast) && goToStep(step.id)}
                  disabled={!isComplete && !isPast && !isActive}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap",
                    isActive && "bg-gold-500 text-white",
                    (isComplete || isPast) && !isActive && "bg-white/10 text-white/80 cursor-pointer hover:bg-white/20",
                    !isActive && !isComplete && !isPast && "bg-white/5 text-white/30 cursor-not-allowed"
                  )}
                >
                  {isComplete ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Icon className="h-3 w-3" />
                  )}
                  {step.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            {STEPS[currentStep - 1].description}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {currentStep === 1 && "Let's start with some basic information about you and your game."}
            {currentStep === 2 && "Tell us what clubs you're currently playing. Skip if you're building a new bag from scratch."}
            {currentStep === 3 && "Describe your typical shot tendencies. This drives the core fitting logic."}
            {currentStep === 4 && "Enter your carry distances. The more complete, the better the gap analysis."}
            {currentStep === 5 && "Add launch monitor data for the highest confidence recommendations. Optional but highly recommended."}
            {currentStep === 6 && "Upload swing videos for future AI analysis. This step is completely optional."}
          </p>
        </div>

        <div className="animate-fade-in">
          {currentStep === 1 && (
            <StepPlayerProfile sessionId={sessionId} onComplete={handleNext} />
          )}
          {currentStep === 2 && (
            <StepCurrentBag sessionId={sessionId} onComplete={handleNext} onSkip={handleSkip} />
          )}
          {currentStep === 3 && (
            <StepShotTendencies sessionId={sessionId} onComplete={handleNext} onSkip={handleSkip} />
          )}
          {currentStep === 4 && (
            <StepDistanceMatrix sessionId={sessionId} onComplete={handleNext} onSkip={handleSkip} />
          )}
          {currentStep === 5 && (
            <StepLaunchMonitor sessionId={sessionId} onComplete={handleNext} onSkip={handleSkip} />
          )}
          {currentStep === 6 && (
            <StepSwingVideo sessionId={sessionId} onComplete={handleAnalyse} onSkip={handleAnalyse} />
          )}
        </div>

        {/* Bottom nav */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => goToStep(currentStep - 1)}
            disabled={currentStep === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {isLastStep && (
            <Button
              variant="gold"
              size="lg"
              onClick={handleAnalyse}
              disabled={isAnalysing}
            >
              {isAnalysing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analysing...
                </>
              ) : (
                <>
                  Generate My Fitting Report
                  <Zap className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
