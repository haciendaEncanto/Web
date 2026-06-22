import type { Metadata } from "next";
import { EventPageTemplate } from "@/components/events/EventPageTemplate";
import type { EventPageConfig } from "@/components/events/types";

export const metadata: Metadata = {
  title: "Quinceañeras en Hacienda El Encanto | Cota, Cundinamarca",
  description:
    "Celebra los quince años más especiales en un entorno mágico. Jardines, salones y atención personalizada en Cota, Cundinamarca.",
  openGraph: {
    title: "Quinceañeras · Hacienda El Encanto",
    description:
      "Un día lleno de magia y elegancia para celebrar los quince años más especiales.",
    locale: "es_CO",
    type: "website",
  },
};

const config: EventPageConfig = {
  hero: {
    image:
      "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2924.jpg",
    tagline: "Quinceañeras · Hacienda El Encanto · Cota, Cundinamarca",
    title: "Quince años llenos de magia",
    subtitle:
      "Un espacio único donde cada momento se convierte en un recuerdo que atesorarás toda la vida.",
    ctaLabel: "Cuéntanos tu celebración",
  },
  experiencia: {
    supertitle: "La experiencia",
    title: "Una celebración que merece todo",
    paragraphs: [
      "Los quince años son un momento único e irrepetible. En Hacienda El Encanto creamos el escenario perfecto para que la protagonista brille y cada detalle cuente su historia.",
      "Desde la decoración hasta la atención a sus invitados, nuestro equipo se dedica a que vivas este día con la magia que siempre soñaste.",
    ],
    highlights: [
      { value: "Mágico", label: "Ambiente" },
      { value: "Especial", label: "Decoración" },
      { value: "Único", label: "Momento" },
      { value: "Exclusivo", label: "Servicio" },
    ],
  },
  gallery: {
    category: "quince",
    supertitle: "Momentos reales",
    title: "Quinceañeras que brillan",
    fallback: [
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2924.jpg",
        title: "Celebración quince años",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2931.jpg",
        title: "Decoración especial",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2937.jpg",
        title: "Jardines El Encanto",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2948.jpg",
        title: "Salón principal",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2953-scaled.jpg",
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
