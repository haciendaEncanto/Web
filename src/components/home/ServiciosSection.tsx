import Image from "next/image";

const servicios = [
  {
    title: "Catering",
    desc: "Banquetes personalizados con sabores inolvidables. Menús gourmet que harán de tu evento una experiencia culinaria única para ti y tus invitados.",
    img: "https://www.hacienda-encanto.com/wp-content/uploads/2024/11/Interior_PistaBaile.jpeg",
  },
  {
    title: "Fotografía y Video",
    desc: "Capturamos cada momento especial. Recuerdos eternos en cada foto y video, historias visuales que contarán tu celebración para siempre.",
    img: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/B2A0101.jpg",
  },
  {
    title: "Decoración",
    desc: "Transformamos tu sueño en una realidad mágica. Ambientes únicos, elegantes y personalizados que harán de tu día algo verdaderamente inolvidable.",
    img: "https://www.hacienda-encanto.com/wp-content/uploads/2024/11/Interior_Love.jpeg",
  },
];

export function ServiciosSection() {
  return (
    <section className="py-24 bg-crema">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-2">
            ¿Qué te ofrecemos?
          </p>
          <h2 className="font-serif text-[2.8rem] font-light text-negro tracking-[-0.03em] leading-[1.15] mb-4">
            Todo lo que necesitas en un solo lugar
          </h2>
          <p className="text-[0.95rem] text-gris max-w-[560px] leading-[1.8] font-light mx-auto">
            Define la fecha, nosotros nos encargamos de lo demás. Te acompañamos
            en cada paso para que solo tengas que disfrutar.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {servicios.map((s) => (
            <div
              key={s.title}
              className="bg-blanco rounded-2xl overflow-hidden transition-transform duration-300 hover:-translate-y-1"
            >
              <div className="relative h-60">
                <Image
                  src={s.img}
                  alt={s.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-7">
                <h3 className="font-serif text-[1.5rem] font-light text-negro mb-2 tracking-[-0.02em]">
                  {s.title}
                </h3>
                <p className="text-[0.85rem] text-gris leading-[1.7] font-light">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
