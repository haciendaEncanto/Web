"use client";

export function TransitionOverlay({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[200] bg-[#F5F0E8] flex items-center justify-center transition-opacity duration-150 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      {visible && (
        <div className="flex flex-col items-center gap-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/trebol-original.svg"
            alt=""
            aria-hidden="true"
            style={{ width: "52px", height: "52px" }}
            className="animate-[trebol-scale_0.4s_ease-out_both]"
          />
          <div className="w-36 h-[2px] overflow-hidden">
            <div className="h-full w-full bg-[#C9A84C] origin-left animate-[line-expand_0.6s_ease-in-out_0.1s_both]" />
          </div>
        </div>
      )}
    </div>
  );
}
