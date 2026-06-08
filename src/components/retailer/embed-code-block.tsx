"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

interface Props {
  code: string;
}

export function EmbedCodeBlock({ code }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative">
      <div className="bg-black/30 rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto pr-12">
        <pre>{code}</pre>
      </div>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors"
        aria-label="Copy embed code"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
