import { EventContactForm } from "./EventContactForm";

const infoItems = [
  { label: "WhatsApp", text: "+57 324 783 6852" },
  { label: "Correo", text: "contacto@hacienda-encanto.com" },
  { label: "Ubicación", text: "Vía Suba Km 5.5, Cota, Cundinamarca" },
  { label: "Instagram", text: "@haciendaelencanto" },
];

interface ContactoConfig {
  defaultEventType: string;
  title: string;
  subtitle: string;
}

export function EventContacto({ config }: { config: ContactoConfig }) {
  return (
    <section id="contacto" className="py-24 bg-crema">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <div className="bg-blanco p-10 rounded-2xl">
            <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-2">
              Escríbenos
            </p>
            <h3 className="font-serif text-[2rem] text-negro font-light tracking-[-0.02em] mb-1">
              {config.title}
            </h3>
            <p className="text-[0.85rem] text-gris font-light mb-8">{config.subtitle}</p>
            <EventContactForm defaultEventType={config.defaultEventType} />
          </div>

          <div>
            <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-2">
              Encuéntranos
            </p>
            <h3 className="font-serif text-[2rem] text-negro font-light tracking-[-0.02em] mb-2">
              Estamos más cerca
              <br />
              de lo que imaginas
            </h3>
            <div className="w-[50px] h-px bg-dorado mb-6" />
            <p className="text-[0.9rem] text-gris font-light leading-[1.8] mb-8">
              Visítanos y enamórate del espacio. Agenda tu visita y recorre cada
              rincón de El Encanto.
            </p>

            {infoItems.map((item) => (
              <div key={item.label} className="flex gap-4 mb-5 items-start">
                <div className="w-11 h-11 rounded-full bg-rojo flex items-center justify-center flex-shrink-0">
                  <span className="text-blanco text-xs font-medium">{item.label[0]}</span>
                </div>
                <div className="text-[0.9rem] text-gris font-light">
                  <strong className="block text-negro font-medium mb-0.5">{item.label}</strong>
                  {item.text}
                </div>
              </div>
            ))}

            <div className="mt-8 rounded-xl overflow-hidden h-[220px] bg-crema-medio">
              <iframe
                src="https://maps.google.com/maps?q=4.782638,-74.089686&z=17&output=embed"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Hacienda El Encanto"
              />
            </div>
            <a
              href="https://www.google.com/maps/dir/?api=1&destination=4.782638,-74.089686"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-[12px] font-medium tracking-[1px] uppercase text-rojo hover:text-rojo-pro transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
              ¿Cómo llegar?
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
