"use client";

import { useState, useEffect, useCallback } from "react";

const KEY_LAST = "contact_last_sent";
const KEY_BACKOFF = "contact_backoff_minutes";
const INITIAL_BACKOFF = 5;
const MAX_BACKOFF = 180;

export function useContactRateLimit() {
  const [blockMessage, setBlockMessage] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => {
      const lastSent = localStorage.getItem(KEY_LAST);
      const backoffStr = localStorage.getItem(KEY_BACKOFF);
      if (!lastSent || !backoffStr) { setBlockMessage(null); return; }

      const remaining = parseInt(lastSent, 10) + parseInt(backoffStr, 10) * 60_000 - Date.now();
      if (remaining > 0) {
        const mins = Math.floor(remaining / 60_000);
        const secs = Math.floor((remaining % 60_000) / 1000);
        const partes = [];
        if (mins > 0) partes.push(`${mins} minuto${mins !== 1 ? "s" : ""}`);
        partes.push(`${secs} segundo${secs !== 1 ? "s" : ""}`);
        setBlockMessage(`Por favor espera ${partes.join(" y ")} antes de enviar otro mensaje`);
      } else {
        setBlockMessage(null);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Llama antes de enviar. Devuelve true si está permitido, false si bloqueado (y duplica el backoff).
  const checkBeforeSend = useCallback((): boolean => {
    const lastSent = localStorage.getItem(KEY_LAST);
    const backoffStr = localStorage.getItem(KEY_BACKOFF);
    if (!lastSent || !backoffStr) return true;

    const remaining = parseInt(lastSent, 10) + parseInt(backoffStr, 10) * 60_000 - Date.now();
    if (remaining > 0) {
      const next = Math.min(parseInt(backoffStr, 10) * 2, MAX_BACKOFF);
      localStorage.setItem(KEY_BACKOFF, next.toString());
      return false;
    }
    return true;
  }, []);

  // Llama cuando la SA confirma éxito.
  const recordSend = useCallback(() => {
    localStorage.setItem(KEY_LAST, Date.now().toString());
    localStorage.setItem(KEY_BACKOFF, INITIAL_BACKOFF.toString());
  }, []);

  return { blockMessage, isBlocked: blockMessage !== null, checkBeforeSend, recordSend };
}
