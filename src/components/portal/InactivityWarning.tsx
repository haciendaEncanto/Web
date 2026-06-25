"use client";

import { useEffect, useState } from "react";

interface Props {
  warningSeconds: number; // 60
  onContinue: () => void;
  onLogout: () => void;
}

export function InactivityWarning({ warningSeconds, onContinue, onLogout }: Props) {
  const [secondsLeft, setSecondsLeft] = useState(warningSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[300] bg-negro/60 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="inactivity-title"
    >
      <div className="bg-crema border border-dorado/50 rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-[page-fade-in_0.25s_ease_both]">
        {/* Ícono trébol */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/trebol-original.svg"
          alt=""
          aria-hidden="true"
          style={{ width: 44, height: 44 }}
          className="mx-auto mb-6 opacity-55"
        />

        {/* Título */}
        <h2
          id="inactivity-title"
          className="font-serif text-[1.55rem] text-negro tracking-[-0.02em] leading-tight mb-3"
        >
          Tu sesión está por expirar
        </h2>

        {/* Texto con contador */}
        <p className="text-[0.85rem] text-gris leading-relaxed mb-5">
          Por seguridad, cerraremos tu sesión en{" "}
          <span className="font-semibold text-negro tabular-nums">
            {secondsLeft}
          </span>{" "}
          {secondsLeft === 1 ? "segundo" : "segundos"}
        </p>

        {/* Barra de progreso que se vacía */}
        <div className="w-full h-[3px] bg-dorado/15 rounded-full mb-7 overflow-hidden">
          <div
            className="h-full w-full bg-dorado rounded-full origin-left transition-transform duration-1000 ease-linear"
            style={{ transform: `scaleX(${secondsLeft / warningSeconds})` }}
          />
        </div>

        {/* Botones */}
        <div className="flex flex-col gap-3">
          <button
            onClick={onContinue}
            className="w-full py-3 bg-rojo text-blanco font-serif tracking-widest text-[0.78rem] uppercase rounded-xl hover:bg-rojo/90 transition-colors"
          >
            Continuar sesión
          </button>
          <button
            onClick={onLogout}
            className="w-full py-2.5 border border-negro/15 text-gris text-[0.82rem] rounded-xl hover:bg-negro/5 transition-colors"
          >
            Cerrar sesión ahora
          </button>
        </div>
      </div>
    </div>
  );
}
