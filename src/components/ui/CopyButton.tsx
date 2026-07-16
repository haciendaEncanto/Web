"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API no disponible (contexto no seguro, permisos, etc.) — se ignora.
    }
  }

  return (
    <span className="inline-flex items-center gap-2 shrink-0">
      {copied && (
        <span className="text-[0.72rem] text-green-600 font-medium">¡Copiado!</span>
      )}
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 text-[0.78rem] text-dorado font-medium hover:underline"
      >
        <Copy size={12} /> Copiar
      </button>
    </span>
  );
}
