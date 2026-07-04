"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface HeroVideo {
  url: string;
  thumbnail_url: string | null;
}

const POSTER =
  "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2953-scaled.jpg";

export function HeroSection({ videos }: { videos: HeroVideo[] }) {
  const ref1 = useRef<HTMLVideoElement>(null);
  const ref2 = useRef<HTMLVideoElement>(null);
  const currentRef = useRef(0);
  const [showVideo, setShowVideo] = useState(false);

  // El video solo se carga en tablet/desktop — en mobile se usa una imagen estática
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setShowVideo(mq.matches);
    const handler = (e: MediaQueryListEvent) => setShowVideo(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!showVideo || videos.length < 2 || !ref1.current || !ref2.current) return;
    const vids = [ref1.current, ref2.current];

    function switchVideo() {
      vids[currentRef.current].style.opacity = "0";
      currentRef.current = (currentRef.current + 1) % 2;
      const next = vids[currentRef.current];
      next.currentTime = 0;
      next.play();
      next.style.opacity = "1";
    }

    vids.forEach((v) => v.addEventListener("ended", switchVideo));
    return () => vids.forEach((v) => v.removeEventListener("ended", switchVideo));
  }, [videos, showVideo]);

  const staticImage = videos[0]?.thumbnail_url ?? POSTER;

  return (
    <section className="relative w-screen overflow-hidden">
      {/* Bloque de video / imagen */}
      <div className="relative w-full h-[calc(100dvh-72px)] md:h-[calc(100vh-72px)] overflow-hidden flex flex-col justify-between">
        {showVideo && videos.length >= 1 ? (
          <>
            <video
              ref={ref1}
              autoPlay
              muted
              loop
              playsInline
              poster={videos[0].thumbnail_url ?? POSTER}
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms]"
              style={{ opacity: 1 }}
            >
              <source src={videos[0].url} type="video/mp4" />
            </video>

            {videos.length >= 2 && (
              <video
                ref={ref2}
                muted
                loop
                playsInline
                poster={videos[1].thumbnail_url ?? undefined}
                className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms]"
                style={{ opacity: 0 }}
              >
                <source src={videos[1].url} type="video/mp4" />
              </video>
            )}
          </>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${staticImage}')` }}
          />
        )}

        {/* Overlay — degradado suave, más oscuro arriba y abajo, casi transparente al centro */}
        <div className="absolute inset-0 bg-gradient-to-b from-negro/30 via-negro/5 to-negro/45" />

        {/* Label superior centrado */}
        <div className="relative z-10 flex flex-col items-center pt-10 md:pt-12 px-6">
          <p
            className="w-full text-center font-sans text-[11px] tracking-[4px] uppercase text-dorado"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.95), 0 2px 14px rgba(0,0,0,0.75)" }}
          >
            Casa de Eventos &middot; Cota &middot; Cundinamarca
          </p>
          <div className="w-[120px] h-[0.6px] bg-dorado mt-3" />
        </div>

        {/* Título centrado, parte baja del video */}
        <div className="absolute inset-x-0 bottom-[8%] z-10 px-6 max-w-[900px] mx-auto text-center">
          <h1
            className="font-serif text-[2.8rem] md:text-[4.5rem] font-light text-blanco leading-[1.1] tracking-[-0.03em]"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.75), 0 4px 28px rgba(0,0,0,0.5)" }}
          >
            El lugar donde tus{" "}
            <em className="italic text-dorado not-italic">sueños</em> se celebran
          </h1>
        </div>
      </div>

      {/* Subtítulo y CTAs — fuera del video, sobre fondo crema */}
      <div className="bg-crema px-6 py-14 md:py-16 text-center">
        <p className="text-[1.05rem] text-negro/70 font-light leading-[1.7] max-w-[550px] mx-auto mb-8">
          Rodeados de naturaleza y elegancia, creamos experiencias únicas para
          los momentos más importantes de tu vida.
        </p>
        <div className="w-[50px] h-px bg-dorado mx-auto mb-8" />
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link
            href="#contacto"
            className="w-full md:w-auto text-center px-9 py-[14px] rounded-lg text-[12px] font-medium tracking-[2px] uppercase transition-all duration-300 bg-rojo text-blanco border-2 border-rojo hover:bg-rojo-pro hover:border-rojo-pro"
          >
            Cuéntanos tu evento
          </Link>
          <Link
            href="#eventos"
            className="w-full md:w-auto text-center px-9 py-[14px] rounded-lg text-[12px] font-medium tracking-[2px] uppercase transition-all duration-300 bg-transparent text-negro border-2 border-negro/25 hover:bg-negro/5"
          >
            Descubre El Encanto
          </Link>
        </div>
      </div>
    </section>
  );
}
