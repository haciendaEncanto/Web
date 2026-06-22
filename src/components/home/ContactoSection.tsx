import { HomeContactForm } from "@/components/contact/HomeContactForm";

const infoItems = [
  {
    icon: "📍",
    title: "Ubicación",
    text: "Vía Suba Km 5.5, Cota, Cundinamarca, Colombia",
  },
  { icon: "📱", title: "WhatsApp", text: "+57 324 783 6852" },
  { icon: "✉️", title: "Correo", text: "contacto@hacienda-encanto.com" },
  { icon: "📷", title: "Instagram", text: "@haciendaelencanto" },
];

export function ContactoSection() {
  return (
    <section id="contacto" className="py-24 bg-crema">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          {/* Formulario */}
          <div className="bg-blanco p-10 rounded-2xl">
            <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-2">
              Escríbenos
            </p>
            <h3 className="font-serif text-[2rem] text-negro font-light tracking-[-0.02em] mb-1">
              Cuéntanos tu evento
            </h3>
            <p className="text-[0.85rem] text-gris font-light mb-8">
              Completa el formulario y nos pondremos en contacto contigo en
              menos de 24 horas.
            </p>
            <HomeContactForm />
          </div>

          {/* Info */}
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
              <div key={item.title} className="flex gap-4 mb-6 items-start">
                <div className="w-11 h-11 rounded-full bg-rojo flex items-center justify-center text-lg flex-shrink-0">
                  {item.icon}
                </div>
                <div className="text-[0.9rem] text-gris font-light">
                  <strong className="block text-negro font-medium mb-0.5">
                    {item.title}
                  </strong>
                  {item.text}
                </div>
              </div>
            ))}

            {/* Mapa */}
            <div className="mt-8 rounded-xl overflow-hidden h-[220px] bg-crema-medio">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3962.5!2d-74.1058!3d4.7969!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNMKwNDcnNDguOCJOIDc0wrAwNicyMC45Ilc!5e0!3m2!1ses!2sco!4v1700000000000"
                width="100%"
                height="220"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación Hacienda El Encanto"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
