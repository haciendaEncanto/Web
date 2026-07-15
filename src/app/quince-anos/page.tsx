import type { Metadata } from "next";
import { EventPageTemplate } from "@/components/events/EventPageTemplate";
import type { EventPageConfig } from "@/components/events/types";

export const metadata: Metadata = {
  title: "Mis XV en Hacienda El Encanto | Cota, Cundinamarca",
  description:
    "Celebra los quince años más especiales en un entorno mágico. Jardines, salones y atención personalizada en Cota, Cundinamarca.",
  openGraph: {
    title: "Mis XV · Hacienda El Encanto",
    description:
      "Un día lleno de magia y elegancia para celebrar los quince años más especiales.",
    locale: "es_CO",
    type: "website",
  },
};

const config: EventPageConfig = {
  hero: {
    image:
      "/placeholder-evento.svg",
    videoEventType: "quince",
    tagline: "Mis XV · Hacienda El Encanto · Cota, Cundinamarca",
    title: "Quince años llenos de magia",
    subtitle:
      "Un espacio único donde cada momento se convierte en un recuerdo que atesorarás toda la vida.",
    ctaLabel: "Cuéntanos tus XV",
  },
  experiencia: {
    text: "Tu quinceañera merece un lugar tan especial como este momento único. En El Encanto te acompañamos para que celebres tus quince años rodeada de quienes más amas, en un espacio lleno de magia, elegancia y recuerdos que durarán toda la vida.",
  },
  gallery: {
    category: "quince",
    supertitle: "Momentos reales",
    title: "Quince años que brillan",
    fallback: [
      {
        url: "/placeholder-evento.svg",
        title: "Celebración quince años",
      },
      {
        url: "/placeholder-evento.svg",
        title: "Decoración especial",
      },
      {
        url: "/placeholder-evento.svg",
        title: "Jardines El Encanto",
      },
      {
        url: "/placeholder-evento.svg",
        title: "Salón principal",
      },
      {
        url: "/placeholder-evento.svg",
        title: "El Encanto",
      },
    ],
  },
  paquetes: {
    supertitle: "Nuestros paquetes",
    title: "Todo para su gran noche",
    subtitle:
      "Diseñamos cada aspecto de la celebración para que la protagonista y su familia disfruten sin preocupaciones.",
    eventType: "Quince Años",
  },
  testimonios: {
    eventType: "Quince Años",
    title: "Ellas celebraron sus quince en El Encanto",
  },
  contacto: {
    defaultEventType: "Quince Años",
    title: "Cuéntanos la celebración",
    subtitle:
      "Comparte los detalles de los quince años y nos pondremos en contacto contigo en menos de 24 horas.",
  },
};

export default function QuinceAnosPage() {
  return <EventPageTemplate config={config} />;
}
