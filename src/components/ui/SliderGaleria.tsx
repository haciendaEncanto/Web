"use client";

import { useState, useEffect, useCallback } from "react";

const INTERVAL_MS = 3500;

const PLACEHOLDERS = [
  {
    url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2953-scaled.jpg",
    title: "Hacienda El Encanto",
  },
  {
    url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2948.jpg",
    title: "Celebración",
  },
  {
    url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2937.jpg",
    title: "Jardines",
  },
  {
    url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2924.jpg",
    title: "Ceremonia",
  },
  {
    url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2931.jpg",
    title: "Recepción",
  },
];

interface SliderImage {
  url: string;
  title: string | null;
}

interface SliderGaleriaProps {
  images: SliderImage[];
  supertitle?: string;
  title?: string;
}

export function SliderGaleria({ images, supertitle, title }: SliderGaleriaProps) {
  const items = images.length >= 1 ? images.slice(0, 8) : PLACEHOLDERS;
  const [current, setCurrent] = useState(0);

  const advance = useCallback(() => {
    setCurrent((i) => (i + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    const id = setInterval(advance, INTERVAL_MS);
    return () => clearInterval(id);
  }, [advance]);

  return (
    <section className="bg-negro">
      {(supertitle || title) && (
        <div className="text-center pt-16 pb-10 px-8">
          {supertitle && (
            <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-2">
              {supertitle}
            </p>
          )}
          {title && (
            <h2 className="font-serif text-[2.2rem] font-light text-crema tracking-[-0.03em] leading-[1.15]">
              {title}
            </h2>
          )}
          <div className="w-[50px] h-px bg-dorado mx-auto mt-4" />
        </div>
      )}

      <div className="relative h-[420px] md:h-[580px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element — multiple <img> con opacity es el patrón correcto para crossfade CSS */}
        {items.map((img, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={img.url}
            src={img.url}
            alt={img.title ?? "Hacienda El Encanto"}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1000ms]"
            style={{ opacity: i === current ? 1 : 0 }}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-negro/70 to-transparent pointer-events-none" />

        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrent(i)}
              aria-label={`Imagen ${i + 1}`}
              className={`h-2 rounded-full transition-all duration-300 focus:outline-none ${
                i === current
                  ? "w-6 bg-dorado"
                  : "w-2 bg-blanco/50 hover:bg-blanco/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
