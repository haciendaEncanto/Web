import Image from "next/image";
import Link from "next/link";

const FALLBACK_IMG: Record<string, string> = {
  boda:         "/placeholder-evento.svg",
  quince:       "/placeholder-evento.svg",
  empresarial:  "/placeholder-evento.svg",
  revelacion:   "/placeholder-evento.svg",
};

const eventos = [
  { key: "boda",        title: "Bodas",                  desc: "El escenario perfecto para tu historia de amor", href: "/bodas" },
  { key: "quince",       title: "Quince Años",            desc: "Un momento único merece un lugar inolvidable",    href: "/quince-anos" },
  { key: "empresarial",  title: "Empresariales",          desc: "Infraestructura y elegancia para tu empresa",     href: "/empresariales" },
  { key: "revelacion",   title: "Revelación de Género",   desc: "El primer gran evento de tu bebé",                href: "/revelacion" },
] as const;

export interface EventosSectionImages {
  boda: string | null;
  quince: string | null;
  empresarial: string | null;
  revelacion: string | null;
}

export function EventosSection({ images }: { images?: EventosSectionImages }) {
  return (
    <section id="eventos" className="py-24 bg-crema">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-2">
            Celebraciones
          </p>
          <h2 className="font-serif text-[2.8rem] font-light text-negro tracking-[-0.03em] leading-[1.15] mb-4">
            Cada evento merece un lugar especial
          </h2>
          <p className="text-[0.95rem] text-gris max-w-[560px] leading-[1.8] font-light mx-auto">
            Desde bodas de ensueño hasta eventos corporativos, cada celebración
            en El Encanto es una historia que merece contarse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {eventos.map((e) => (
            <Link
              key={e.href}
              href={e.href}
              className="relative rounded-2xl overflow-hidden h-[420px] group block"
            >
              <Image
                src={images?.[e.key] ?? FALLBACK_IMG[e.key]}
                alt={e.title}
                fill
                className="object-cover transition-transform duration-[600ms] group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-negro/80 via-negro/10 to-transparent flex flex-col justify-end p-8">
                <h3 className="font-serif text-[1.8rem] text-blanco font-light tracking-[-0.02em] mb-1">
                  {e.title}
                </h3>
                <p className="text-[0.85rem] text-blanco/70 font-light">{e.desc}</p>
                <span className="text-[11px] tracking-[2px] uppercase text-dorado mt-3 inline-block group-hover:text-blanco transition-colors duration-300">
                  Conoce más →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
