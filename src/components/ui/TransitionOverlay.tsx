"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

function subscribe() {
  return () => {};
}
function getClientSnapshot() {
  return true;
}
function getServerSnapshot() {
  return false;
}

export function TransitionOverlay({ visible }: { visible: boolean }) {
  // Portal a document.body: si este componente se renderiza dentro de un
  // ancestro con backdrop-filter/filter/transform (p. ej. el <nav> con
  // backdrop-blur-md), "fixed" queda contenido en ESE ancestro en vez del
  // viewport — el overlay se ve como una franja diminuta en vez de cubrir
  // toda la pantalla. El portal lo desprende de cualquier ancestro así.
  const mounted = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  const overlay = (
    <div
      className={`fixed inset-0 z-[200] bg-[#F5F0E8] overflow-hidden flex items-center justify-center pointer-events-none transition-opacity duration-150 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      {visible && (
        <div className="flex flex-col items-center gap-8">
          {/* Trébol — 60px mobile, 80px desktop */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/trebol-original.svg"
            alt=""
            aria-hidden="true"
            className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] animate-[trebol-scale_0.4s_ease-out_both]"
          />

          {/* Barra de progreso — 200px mobile, 280px desktop */}
          <div className="w-[200px] md:w-[280px] h-[3px] rounded-full bg-[#F5EDD0] overflow-hidden">
            <div className="h-full w-full rounded-full bg-[#C9A84C] origin-left animate-[line-expand_0.8s_ease-out_both]" />
          </div>
        </div>
      )}
    </div>
  );

  if (!mounted) return null;
  return createPortal(overlay, document.body);
}
