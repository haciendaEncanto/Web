"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { PromocionRow } from "@/app/actions/editor/promociones";

export function PromoModal({ promos }: { promos: PromocionRow[] }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (promos.length === 0) return;
    const t = setTimeout(() => {
      setMounted(true);
      // Pequeño delay para que la animación de fade-in sea perceptible
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    }, 800);
    return () => clearTimeout(t);
  }, [promos.length]);

  const close = useCallback(() => {
    setVisible(false);
    setTimeout(() => setMounted(false), 300);
  }, []);

  const prev = useCallback(() =>
    setCurrent((c) => (c - 1 + promos.length) % promos.length), [promos.length]);
  const next = useCallback(() =>
    setCurrent((c) => (c + 1) % promos.length), [promos.length]);

  // Cerrar con Escape
  useEffect(() => {
    if (!mounted) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mounted, close]);

  if (!mounted || promos.length === 0) return null;

  const promo = promos[current];

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        transition: "opacity 0.3s ease",
        opacity: visible ? 1 : 0,
      }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-negro/70"
        onClick={close}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-[600px] rounded-2xl overflow-hidden shadow-2xl"
        style={{
          transition: "transform 0.3s ease, opacity 0.3s ease",
          transform: visible ? "scale(1) translateY(0)" : "scale(0.96) translateY(12px)",
          opacity: visible ? 1 : 0,
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Promoción"
      >
        {/* Botón cerrar */}
        <button
          onClick={close}
          aria-label="Cerrar"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-negro/50 hover:bg-negro/75 flex items-center justify-center text-blanco transition-colors"
        >
          <X size={16} />
        </button>

        {/* Imagen */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={promo.imagen_url}
          alt="Promoción"
          className="w-full h-auto max-h-[80vh] object-contain bg-negro"
          draggable={false}
        />

        {/* Controles carrusel — solo si hay más de 1 */}
        {promos.length > 1 && (
          <>
            {/* Flechas */}
            <button
              onClick={prev}
              aria-label="Anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-negro/50 hover:bg-negro/75 flex items-center justify-center text-blanco transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={next}
              aria-label="Siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-negro/50 hover:bg-negro/75 flex items-center justify-center text-blanco transition-colors"
            >
              <ChevronRight size={18} />
            </button>

            {/* Dots */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {promos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Ir a promoción ${i + 1}`}
                  className="rounded-full transition-all duration-200"
                  style={{
                    width: i === current ? "20px" : "8px",
                    height: "8px",
                    backgroundColor: i === current ? "var(--color-dorado, #C9A96E)" : "rgba(255,255,255,0.5)",
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
