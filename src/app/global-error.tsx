"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body style={{ fontFamily: "sans-serif", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", margin: 0, backgroundColor: "#fff" }}>
        <div style={{ textAlign: "center", maxWidth: 400, padding: "0 16px" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>
            FairwayFit AI hit an unexpected error. Please try again.
          </p>
          <button
            onClick={reset}
            style={{ padding: "10px 24px", backgroundColor: "#166534", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: 600 }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
