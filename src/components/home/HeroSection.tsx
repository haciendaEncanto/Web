"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

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

  useEffect(() => {
    if (videos.length < 2) return;
    const vids = [ref1.current!, ref2.current!];

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
  }, [videos]);

  return (
    <section className="min-h-screen flex items-center justify-center text-center relative overflow-hidden">
      {/* Video 1 */}
      {videos.length >= 1 ? (
        <video
          ref={ref1}
          autoPlay
          muted
          playsInline
          poster={videos[0].thumbnail_url ?? POSTER}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms]"
          style={{ opacity: 1 }}
        >
          <source src={videos[0].url} type="video/mp4" />
        </video>
      ) : (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${POSTER}')` }}
        />
      )}

      {/* Video 2 — solo si hay dos videos */}
      {videos.length >= 2 && (
        <video
          ref={ref2}
          muted
          playsInline
          poster={videos[1].thumbnail_url ?? undefined}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1500ms]"
          style={{ opacity: 0 }}
        >
          <source src={videos[1].url} type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-negro/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-negro/30 via-negro/10 to-negro/40" />

      {/* Contenido */}
      <div className="relative z-10 px-8 max-w-[800px]">
        <p
          className="text-[11px] tracking-[6px] uppercase text-dorado mb-6 font-light"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.95), 0 2px 14px rgba(0,0,0,0.75)" }}
        >
          Casa de Eventos &bull; Cota, Cundinamarca
        </p>
        <h1
          className="font-serif text-[2.8rem] md:text-[4.5rem] font-light text-blanco leading-[1.1] tracking-[-0.03em] mb-4"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.75), 0 4px 28px rgba(0,0,0,0.5)" }}
        >
          El lugar donde tus{" "}
          <em className="italic text-dorado not-italic">sueños</em> se celebran
        </h1>
        <p className="text-[1.05rem] text-blanco/80 mb-10 font-light leading-[1.7] max-w-[550px] mx-auto">
          Rodeados de naturaleza y elegancia, creamos experiencias únicas para
          los momentos más importantes de tu vida.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="#contacto"
            className="inline-block px-9 py-[14px] rounded-lg text-[12px] font-medium tracking-[2px] uppercase transition-all duration-300 bg-rojo text-blanco border-2 border-rojo hover:bg-rojo-pro hover:border-rojo-pro"
          >
            Cuéntanos tu evento
          </Link>
          <Link
            href="#eventos"
            className="inline-block px-9 py-[14px] rounded-lg text-[12px] font-medium tracking-[2px] uppercase transition-all duration-300 bg-transparent text-blanco border-2 border-blanco hover:bg-blanco/15"
          >
            Descubre El Encanto
          </Link>
        </div>
      </div>
    </section>
  );
}
