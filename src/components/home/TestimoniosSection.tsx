"use client";

import { useState } from "react";
import Image from "next/image";

const TESTIMONIAL_VIDEOS = Array.from(
  { length: 10 },
  (_, i) => `https://contenido.hacienda-encanto.com/testimonios/${i + 1}.mp4`,
);

interface Testimonio {
  client_name: string;
  event_type: string | null;
  rating: number | null;
  content: string;
  photo_url: string | null;
}

export function TestimoniosSection({ testimonials }: { testimonials: Testimonio[] }) {
  const [current, setCurrent] = useState(0);

  function advance() {
    setCurrent((i) => (i + 1) % TESTIMONIAL_VIDEOS.length);
  }

  return (
    <section className="py-24 bg-blush">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-2">
            Testimonios
          </p>
          <h2 className="font-serif text-[2.8rem] font-light text-negro tracking-[-0.03em] leading-[1.15]">
            Ellos dijeron sí en El Encanto
          </h2>
          <div className="w-[50px] h-px bg-dorado mx-auto mt-4" />
        </div>

        {/* Reproductor de video */}
        <div className={`flex flex-col items-center ${testimonials.length > 0 ? "mb-16" : ""}`}>
          <div className="w-full md:w-[45%]">
            <video
              key={current}
              src={TESTIMONIAL_VIDEOS[current]}
              controls
              className="w-full h-[320px] rounded-2xl bg-negro object-contain"
              onEnded={advance}
            />
          </div>

          {/* Indicador de puntos */}
          <div className="flex items-center gap-2 mt-5">
            {TESTIMONIAL_VIDEOS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrent(i)}
                aria-label={`Video ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === current
                    ? "w-6 bg-dorado"
                    : "w-2 bg-negro/25 hover:bg-negro/45"
                }`}
              />
            ))}
          </div>
          <p className="text-[0.78rem] text-gris/70 mt-2 tracking-[1px]">
            {current + 1} / {TESTIMONIAL_VIDEOS.length}
          </p>
        </div>

        {/* Testimonios de texto (cuando Supabase está disponible) */}
        {testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t) => (
              <div key={t.client_name} className="bg-blanco rounded-2xl p-10 relative">
                <span className="absolute top-[10px] left-5 font-serif text-[5rem] text-rojo/15 leading-none select-none pointer-events-none">
                  &ldquo;
                </span>
                <div className="text-dorado text-sm tracking-[2px] mb-4">
                  {"★".repeat(t.rating ?? 5)}
                </div>
                <p className="text-[0.9rem] text-gris leading-[1.8] italic font-light mb-6">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src={t.photo_url ?? "/placeholder-avatar.svg"}
                    alt={t.client_name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover flex-shrink-0"
                  />
                  <div>
                    <div className="font-medium text-[0.9rem] text-negro">{t.client_name}</div>
                    <div className="text-[0.75rem] text-gris">{t.event_type}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
