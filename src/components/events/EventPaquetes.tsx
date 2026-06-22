import type { EventPackage } from "./types";

interface PaquetesConfig {
  supertitle: string;
  title: string;
  subtitle: string;
}

export function EventPaquetes({
  packages,
  config,
}: {
  packages: EventPackage[];
  config: PaquetesConfig;
}) {
  return (
    <section className="py-24 bg-blush">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="text-center mb-16">
          <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-2">
            {config.supertitle}
          </p>
          <h2 className="font-serif text-[2.8rem] font-light text-negro tracking-[-0.03em] leading-[1.15] mb-4">
            {config.title}
          </h2>
          <div className="w-[50px] h-px bg-dorado mx-auto mb-4" />
          <p className="text-[0.95rem] text-gris font-light max-w-[560px] mx-auto leading-[1.8]">
            {config.subtitle}
          </p>
        </div>

        {packages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-[0.95rem] text-gris font-light mb-8">
              Cada celebración en El Encanto es personalizada. Conversemos sobre
              los detalles de tu evento.
            </p>
            <a
              href="#contacto"
              className="inline-block px-9 py-[14px] rounded-lg text-[12px] font-medium tracking-[2px] uppercase bg-rojo text-blanco hover:bg-rojo-pro transition-colors duration-300"
            >
              Conoce más
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {packages.map((pkg) => (
              <div key={pkg.id} className="bg-blanco rounded-2xl p-8 flex flex-col">
                <h3 className="font-serif text-[1.5rem] font-light text-negro mb-2">
                  {pkg.name}
                </h3>
                {pkg.description && (
                  <p className="text-[0.85rem] text-gris font-light leading-[1.7] mb-4">
                    {pkg.description}
                  </p>
                )}
                <div className="w-[40px] h-px bg-dorado mb-5" />
                <ul className="space-y-[10px] flex-1">
                  {pkg.includes.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-[0.85rem] text-gris font-light"
                    >
                      <span className="text-dorado mt-[2px] flex-shrink-0 text-[10px]">✦</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contacto"
                  className="mt-8 block text-center text-[11px] tracking-[2px] uppercase text-rojo border border-rojo rounded-lg py-[10px] hover:bg-rojo hover:text-blanco transition-all duration-300"
                >
                  Conoce más
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
