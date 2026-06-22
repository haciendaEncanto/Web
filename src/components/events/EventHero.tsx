import Link from "next/link";

interface EventHeroProps {
  image: string;
  tagline: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
}

export function EventHero({ image, tagline, title, subtitle, ctaLabel }: EventHeroProps) {
  return (
    <section className="min-h-screen flex items-center justify-center text-center relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${image}')` }}
      />
      <div className="absolute inset-0 bg-negro/55" />
      <div className="absolute inset-0 bg-gradient-to-b from-negro/30 via-negro/10 to-negro/40" />

      <div className="relative z-10 px-8 max-w-[800px]">
        <p
          className="text-[11px] tracking-[6px] uppercase text-dorado mb-6 font-light"
          style={{ textShadow: "0 1px 6px rgba(0,0,0,0.95), 0 2px 14px rgba(0,0,0,0.75)" }}
        >
          {tagline}
        </p>
        <h1
          className="font-serif text-[2.8rem] md:text-[4.5rem] font-light text-blanco leading-[1.1] tracking-[-0.03em] mb-4"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.75), 0 4px 28px rgba(0,0,0,0.5)" }}
        >
          {title}
        </h1>
        <p className="text-[1.05rem] text-blanco/80 mb-10 font-light leading-[1.7] max-w-[550px] mx-auto">
          {subtitle}
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="#contacto"
            className="inline-block px-9 py-[14px] rounded-lg text-[12px] font-medium tracking-[2px] uppercase transition-all duration-300 bg-rojo text-blanco border-2 border-rojo hover:bg-rojo-pro hover:border-rojo-pro"
          >
            {ctaLabel}
          </Link>
          <Link
            href="#galeria"
            className="inline-block px-9 py-[14px] rounded-lg text-[12px] font-medium tracking-[2px] uppercase transition-all duration-300 bg-transparent text-blanco border-2 border-blanco hover:bg-blanco/15"
          >
            Ver galería
          </Link>
        </div>
      </div>
    </section>
  );
}
