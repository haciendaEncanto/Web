import type { Metadata } from "next";
import { EventPageTemplate } from "@/components/events/EventPageTemplate";
import type { EventPageConfig } from "@/components/events/types";

export const metadata: Metadata = {
  title: "Eventos Empresariales · Hacienda El Encanto | Cota, Cundinamarca",
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
      "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2937.jpg",
    tagline: "Corporativo · Hacienda El Encanto · Cota, Cundinamarca",
    title: "Eventos empresariales que inspiran",
    subtitle:
      "Un entorno exclusivo fuera de la ciudad para reuniones, conferencias y celebraciones corporativas que marcan la diferencia.",
    ctaLabel: "Cuéntanos tu evento",
  },
  experiencia: {
    supertitle: "La experiencia",
    title: "El espacio que tu empresa merece",
    paragraphs: [
      "Hacienda El Encanto ofrece un ambiente único para salir de la rutina corporativa. Nuestros espacios combinan la tranquilidad de la naturaleza con la infraestructura necesaria para eventos profesionales de alto nivel.",
      "Ideal para lanzamientos de producto, reuniones de directivos, team building y celebraciones de fin de año que dejan huella en cada participante.",
    ],
    highlights: [
      { value: "Profesional", label: "Ambiente" },
      { value: "Exclusivo", label: "Espacio" },
      { value: "Natural", label: "Entorno" },
      { value: "Flexible", label: "Configuración" },
    ],
  },
  gallery: {
    category: "empresarial",
    supertitle: "Nuestros espacios",
    title: "El escenario perfecto",
    fallback: [
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2937.jpg",
        title: "Espacio corporativo",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2948.jpg",
        title: "Salón principal",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2953-scaled.jpg",
        title: "Jardines",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2924.jpg",
        title: "Áreas al aire libre",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2931.jpg",
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
