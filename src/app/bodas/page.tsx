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
      "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2953-scaled.jpg",
    videoEventType: "boda",
    tagline: "Bodas · Hacienda El Encanto · Cota, Cundinamarca",
    title: "El día más especial de tu vida",
    subtitle:
      "Rodeados de naturaleza y elegancia, convertimos cada detalle en una celebración de amor que se recuerda para siempre.",
    ctaLabel: "Cuéntanos tu boda",
  },
  experiencia: {
    supertitle: "La experiencia",
    title: "Una boda que se siente en el alma",
    paragraphs: [
      "En Hacienda El Encanto entendemos que tu boda es única. Cada detalle, desde la iluminación hasta la disposición de las mesas, se diseña para reflejar la historia de amor que quieren contar.",
      "Nuestros espacios combinan la elegancia rústica de una hacienda histórica con la calidez y el servicio personalizado que merece el día más importante de sus vidas.",
    ],
    highlights: [
      { value: "Íntimo", label: "Ambiente" },
      { value: "Elegante", label: "Estilo" },
      { value: "Natural", label: "Entorno" },
      { value: "Personal", label: "Atención" },
    ],
  },
  gallery: {
    category: "boda",
    supertitle: "Momentos reales",
    title: "Bodas que inspiran",
    fallback: [
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2953-scaled.jpg",
        title: "Celebración El Encanto",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2948.jpg",
        title: "Decoración",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2937.jpg",
        title: "Jardines",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2924.jpg",
        title: "Ceremonia",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2931.jpg",
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
