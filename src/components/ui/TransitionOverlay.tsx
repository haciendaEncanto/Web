"use client";

export function TransitionOverlay({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[200] bg-[#F5F0E8] overflow-hidden flex items-center justify-center transition-opacity duration-150 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
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
}
