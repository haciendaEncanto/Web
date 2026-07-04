import Link from "next/link";

interface EventHeroProps {
  image: string;
  tagline: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  videoUrl?: string | null;
}

export function EventHero({
  image,
  tagline,
  title,
  subtitle,
  ctaLabel,
  videoUrl,
}: EventHeroProps) {
  return (
    <section className="relative w-screen overflow-hidden">
      {/* Bloque de video / imagen */}
      <div className="relative w-full h-[calc(100dvh-72px)] md:h-[calc(100vh-72px)] overflow-hidden flex flex-col justify-between">
        {videoUrl ? (
          <video
            autoPlay
            muted
            loop
            playsInline
            poster={image}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url('${image}')` }}
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
            {tagline}
          </p>
          <div className="w-[120px] h-[0.6px] bg-dorado mt-3" />
        </div>

        {/* Título centrado, parte baja del video */}
        <div className="absolute inset-x-0 bottom-[8%] z-10 px-6 max-w-[900px] mx-auto text-center">
          <h1
            className="font-serif text-[2.8rem] md:text-[4.5rem] font-light text-blanco leading-[1.1] tracking-[-0.03em]"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.75), 0 4px 28px rgba(0,0,0,0.5)" }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* Subtítulo y CTAs — fuera del video, sobre fondo crema */}
      <div className="bg-crema px-6 py-14 md:py-16 text-center">
        <p className="text-[1.05rem] text-negro/70 font-light leading-[1.7] max-w-[550px] mx-auto mb-8">
          {subtitle}
        </p>
        <div className="w-[50px] h-px bg-dorado mx-auto mb-8" />
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link
            href="#contacto"
            className="w-full md:w-auto text-center px-9 py-[14px] rounded-lg text-[12px] font-medium tracking-[2px] uppercase transition-all duration-300 bg-rojo text-blanco border-2 border-rojo hover:bg-rojo-pro hover:border-rojo-pro"
          >
            {ctaLabel}
          </Link>
          <Link
            href="#galeria"
            className="w-full md:w-auto text-center px-9 py-[14px] rounded-lg text-[12px] font-medium tracking-[2px] uppercase transition-all duration-300 bg-transparent text-negro border-2 border-negro/25 hover:bg-negro/5"
          >
            Ver galería
          </Link>
        </div>
      </div>
    </section>
  );
}
