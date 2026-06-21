import Link from "next/link";

export function CTASection() {
  return (
    <section className="py-20 bg-verde-bosque text-center relative overflow-hidden">
      {/* Círculo decorativo */}
      <div className="absolute -top-[60px] -right-[60px] w-[200px] h-[200px] rounded-full border border-blanco/[0.08] pointer-events-none" />

      <div className="relative max-w-[1200px] mx-auto px-8">
        <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-2">
          ¿Listo para vivir la experiencia?
        </p>
        <h2 className="font-serif text-[2.8rem] font-light text-crema tracking-[-0.03em] leading-[1.15] mb-2">
          Tu evento soñado comienza aquí
        </h2>
        <div className="w-[50px] h-px bg-dorado mx-auto my-6" />
        <p className="text-crema/70 mb-8 font-light">
          Cuéntanos tu idea y juntos la convertimos en una celebración
          inolvidable.
        </p>
        <Link
          href="#contacto"
          className="inline-block px-9 py-[14px] rounded-lg text-[12px] font-medium tracking-[2px] uppercase transition-all duration-300 bg-rojo text-blanco border-2 border-rojo hover:bg-rojo-pro hover:border-rojo-pro"
        >
          Hablemos de tu evento
        </Link>
      </div>
    </section>
  );
}
