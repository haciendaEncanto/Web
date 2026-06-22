interface DescripcionConfig {
  supertitle: string;
  title: string;
  paragraphs: string[];
  highlights: Array<{ value: string; label: string }>;
}

export function EventDescripcion({ config }: { config: DescripcionConfig }) {
  return (
    <section className="py-24 bg-crema">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-3">
              {config.supertitle}
            </p>
            <h2 className="font-serif text-[2.5rem] font-light text-negro tracking-[-0.03em] leading-[1.15] mb-6">
              {config.title}
            </h2>
            <div className="w-[50px] h-px bg-dorado mb-8" />
            {config.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-[0.95rem] text-gris font-light leading-[1.9] mb-4 last:mb-0"
              >
                {p}
              </p>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            {config.highlights.map((h) => (
              <div
                key={h.label}
                className="text-center p-8 bg-blanco rounded-2xl border border-crema-medio"
              >
                <div className="font-serif text-[1.8rem] font-light text-rojo mb-2 italic">
                  {h.value}
                </div>
                <div className="text-[0.7rem] tracking-[3px] uppercase text-gris font-medium">
                  {h.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
