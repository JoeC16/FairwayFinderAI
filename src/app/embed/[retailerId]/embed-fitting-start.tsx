"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface RetailerInfo {
  id: string;
  name: string;
  primaryColor: string;
  welcomeTitle: string | null;
  welcomeText: string | null;
  ctaText: string | null;
  showBranding: boolean;
}

interface Props {
  retailer: RetailerInfo;
}

export function EmbedFittingStart({ retailer }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function startFitting() {
    setLoading(true);
    try {
      const res = await fetch("/api/fitting/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ retailerId: retailer.id, source: "widget" }),
      });
      const data = await res.json() as { sessionId?: string; guestToken?: string };
      if (data.sessionId) {
        if (data.guestToken) {
          sessionStorage.setItem("guestToken", data.guestToken);
        }
        router.push(`/fitting/${data.sessionId}`);
      }
    } catch {
      setLoading(false);
    }
  }

  const primaryColor = retailer.primaryColor;

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "#f9fafb" }}>
      <div style={{ width: "100%", maxWidth: "480px", background: "white", borderRadius: "16px", padding: "40px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)", textAlign: "center" }}>
        <div style={{
          width: "56px", height: "56px", borderRadius: "14px",
          background: primaryColor, display: "flex", alignItems: "center",
          justifyContent: "center", margin: "0 auto 24px"
        }}>
          <svg viewBox="0 0 24 24" fill="none" style={{ width: "28px", height: "28px" }}>
            <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M12 2v20M3 7l9 5 9-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#111827", marginBottom: "12px", margin: "0 0 12px" }}>
          {retailer.welcomeTitle ?? "Find Your Perfect Clubs"}
        </h1>
        <p style={{ color: "#6b7280", fontSize: "15px", lineHeight: "1.6", marginBottom: "32px" }}>
          {retailer.welcomeText ?? "Answer a few questions about your game and get personalised equipment recommendations — just like a professional fitting session."}
        </p>

        <button
          onClick={startFitting}
          disabled={loading}
          style={{
            width: "100%", padding: "14px 24px", borderRadius: "10px",
            background: primaryColor, color: "white", fontSize: "16px",
            fontWeight: "600", border: "none", cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.8 : 1, display: "flex", alignItems: "center",
            justifyContent: "center", gap: "8px",
          }}
        >
          {loading && (
            <span style={{ display: "inline-block", width: "16px", height: "16px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          )}
          {retailer.ctaText ?? "Start My Fitting"}
        </button>

        {retailer.showBranding && (
          <p style={{ marginTop: "24px", fontSize: "12px", color: "#d1d5db" }}>
            Powered by FairwayFit AI
          </p>
        )}
      </div>
    </div>
  );
}
