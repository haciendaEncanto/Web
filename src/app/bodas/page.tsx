import type { Metadata } from "next";
import { EventPageTemplate } from "@/components/events/EventPageTemplate";
import type { EventPageConfig } from "@/components/events/types";

export const metadata: Metadata = {
  title: "Bodas en Hacienda El Encanto | Cota, Cundinamarca",
  description:
    "Celebra tu boda en un entorno único. Salones elegantes, jardines y naturaleza en Cota, Cundinamarca. Haz realidad la boda que siempre soñaste.",
  openGraph: {
    title: "Bodas · Hacienda El Encanto",
    description:
      "Cada detalle de tu boda, diseñado para reflejar la historia de amor que quieren contar.",
    locale: "es_CO",
    type: "website",
  },
};

const config: EventPageConfig = {
  hero: {
    image:
      "/placeholder-evento.svg",
    videoEventType: "boda",
    tagline: "Bodas · Hacienda El Encanto · Cota, Cundinamarca",
    title: "El día más especial de tu vida",
    subtitle:
      "Rodeados de naturaleza y elegancia, convertimos cada detalle en una celebración de amor que se recuerda para siempre.",
    ctaLabel: "Cuéntanos tu boda",
  },
  experiencia: {
    text: "En Hacienda El Encanto, tu boda es mucho más que un evento — es el inicio de una historia de amor que merece el escenario perfecto. Rodeados de naturaleza, elegancia y un equipo dedicado a cada detalle, hacemos realidad el día que siempre soñaste.",
  },
  gallery: {
    category: "boda",
    supertitle: "Momentos reales",
    title: "Bodas que inspiran",
    fallback: [
      {
        url: "/placeholder-evento.svg",
        title: "Celebración El Encanto",
      },
      {
        url: "/placeholder-evento.svg",
        title: "Decoración",
      },
      {
        url: "/placeholder-evento.svg",
        title: "Jardines",
      },
      {
        url: "/placeholder-evento.svg",
        title: "Ceremonia",
      },
      {
        url: "/placeholder-evento.svg",
        title: "Recepción",
      },
    ],
  },
  paquetes: {
    supertitle: "Nuestros paquetes",
    title: "Todo lo que tu boda necesita",
    subtitle:
      "Cada paquete incluye lo esencial para que disfruten su día sin preocupaciones. Conversemos sobre los detalles de su celebración.",
    eventType: "Boda",
  },
  testimonios: {
    eventType: "Boda",
    title: "Ellos eligieron El Encanto para su boda",
  },
  contacto: {
    defaultEventType: "Boda",
    title: "Cuéntanos tu boda",
    subtitle:
      "Comparte los detalles de tu celebración y nos pondremos en contacto contigo en menos de 24 horas.",
  },
};

export default function BodasPage() {
  return <EventPageTemplate config={config} />;
}
