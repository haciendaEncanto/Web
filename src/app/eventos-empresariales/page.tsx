import type { Metadata } from "next";
import { EventPageTemplate } from "@/components/events/EventPageTemplate";
import type { EventPageConfig } from "@/components/events/types";

export const metadata: Metadata = {
  title: "Eventos Empresariales | Hacienda El Encanto Cota",
  description:
    "Organiza tu próximo evento corporativo en un entorno único. Reuniones, conferencias y team building en Cota, Cundinamarca.",
  openGraph: {
    title: "Eventos Empresariales · Hacienda El Encanto",
    description:
      "El espacio ideal para tus eventos corporativos. Naturaleza, elegancia y tecnología al servicio de tu empresa.",
    locale: "es_CO",
    type: "website",
  },
};

const config: EventPageConfig = {
  hero: {
    image:
      "/placeholder-evento.svg",
    videoEventType: "empresarial",
    tagline: "Corporativo · Hacienda El Encanto · Cota, Cundinamarca",
    title: "Eventos empresariales que inspiran",
    subtitle:
      "Un entorno exclusivo fuera de la ciudad para reuniones, conferencias y celebraciones corporativas que marcan la diferencia.",
    ctaLabel: "Cuéntanos tu evento",
  },
  experiencia: {
    text: "Hacienda El Encanto ofrece el escenario ideal para tus eventos corporativos. Con capacidad para más de 150 personas, infraestructura completa de sonido y proyección, y un entorno natural que inspira, transformamos cada reunión en una experiencia memorable.",
  },
  gallery: {
    category: "empresarial",
    supertitle: "Nuestros espacios",
    title: "El escenario perfecto",
    fallback: [
      {
        url: "/placeholder-evento.svg",
        title: "Espacio corporativo",
      },
      {
        url: "/placeholder-evento.svg",
        title: "Salón principal",
      },
      {
        url: "/placeholder-evento.svg",
        title: "Jardines",
      },
      {
        url: "/placeholder-evento.svg",
        title: "Áreas al aire libre",
      },
      {
        url: "/placeholder-evento.svg",
        title: "Recepción",
      },
    ],
  },
  paquetes: {
    supertitle: "Nuestros paquetes",
    title: "Soluciones para cada evento",
    subtitle:
      "Desde reuniones íntimas hasta grandes eventos corporativos, tenemos el paquete ideal para las necesidades de tu empresa.",
    eventType: "Evento Empresarial",
  },
  testimonios: {
    eventType: "Evento Empresarial",
    title: "Empresas que confiaron en El Encanto",
  },
  contacto: {
    defaultEventType: "Evento Empresarial",
    title: "Cuéntanos tu evento",
    subtitle:
      "Comparte los detalles de tu evento corporativo y nos pondremos en contacto contigo en menos de 24 horas.",
  },
};

export default function EventosEmpresarialesPage() {
  return <EventPageTemplate config={config} />;
}
