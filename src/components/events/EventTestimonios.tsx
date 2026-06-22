import Image from "next/image";
import type { EventTestimonio } from "./types";

const AVATARS: Record<string, string> = {
  "Verónica":
    "https://www.hacienda-encanto.com/wp-content/uploads/2024/07/pareja2_beso-150x150.jpeg",
  "Carolina y Andrés":
    "https://www.hacienda-encanto.com/wp-content/uploads/2024/07/pareja_tarde-150x150.jpeg",
  "Ana y Carlos":
    "https://www.hacienda-encanto.com/wp-content/uploads/2024/07/pareja_2-150x150.jpeg",
};

export function EventTestimonios({
  testimonials,
  title,
}: {
  testimonials: EventTestimonio[];
  title: string;
}) {
  if (!testimonials.length) return null;

  return (
    <section className="py-24 bg-crema">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-2">
            Testimonios
          </p>
          <h2 className="font-serif text-[2.8rem] font-light text-negro tracking-[-0.03em] leading-[1.15]">
            {title}
          </h2>
          <div className="w-[50px] h-px bg-dorado mx-auto mt-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => {
            const avatar = AVATARS[t.client_name];
            return (
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
                  {avatar && (
                    <Image
                      src={avatar}
                      alt={t.client_name}
                      width={48}
                      height={48}
                      className="rounded-full object-cover flex-shrink-0"
                    />
                  )}
                  <div>
                    <div className="font-medium text-[0.9rem] text-negro">
                      {t.client_name}
                    </div>
                    <div className="text-[0.75rem] text-gris">{t.event_type}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
