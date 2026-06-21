import Image from "next/image";

const images = [
  {
    src: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2953-scaled.jpg",
    alt: "Evento El Encanto",
  },
  {
    src: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2948.jpg",
    alt: "Evento El Encanto",
  },
  {
    src: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2937.jpg",
    alt: "Evento El Encanto",
  },
  {
    src: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2924.jpg",
    alt: "Evento El Encanto",
  },
  {
    src: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2931.jpg",
    alt: "Evento El Encanto",
  },
];

export function GaleriaSection() {
  return (
    <section className="py-24 bg-negro">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-12">
          <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-2">
            Momentos reales
          </p>
          <h2 className="font-serif text-[2.8rem] font-light text-crema tracking-[-0.03em] leading-[1.15]">
            Así vivimos los eventos
          </h2>
          <div className="w-[50px] h-px bg-dorado mx-auto my-4" />
          <p className="text-[0.95rem] text-gris max-w-[560px] leading-[1.8] font-light mx-auto">
            Cada imagen cuenta una historia de celebración, amor y momentos
            compartidos en El Encanto.
          </p>
        </div>

        {/*
          Desktop: 4 cols, 2 filas de 200px — primer item ocupa 2×2
          Mobile:  2 cols, alturas explícitas por item
        */}
        <div
          className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-0.5"
          style={{ gridTemplateRows: "repeat(2, 200px)" }}
        >
          {images.map((img, i) => (
            <div
              key={img.src}
              className={`relative overflow-hidden rounded-lg group ${
                i === 0
                  ? "h-[300px] md:h-auto md:col-span-2 md:row-span-2"
                  : "h-[150px] md:h-auto"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                sizes={
                  i === 0
                    ? "(max-width: 768px) 50vw, 50vw"
                    : "(max-width: 768px) 50vw, 25vw"
                }
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
