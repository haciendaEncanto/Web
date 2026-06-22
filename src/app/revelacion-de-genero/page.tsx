import type { Metadata } from "next";
import { EventPageTemplate } from "@/components/events/EventPageTemplate";
import type { EventPageConfig } from "@/components/events/types";

export const metadata: Metadata = {
  title: "Revelación de Género · Hacienda El Encanto | Cota, Cundinamarca",
  description:
    "Celebra el momento más esperado en un entorno mágico. Revelaciones de género íntimas y memorables en Cota, Cundinamarca.",
  openGraph: {
    title: "Revelación de Género · Hacienda El Encanto",
    description:
      "El momento en que todo cambia. Celébralo rodeado de quienes más amas en Hacienda El Encanto.",
    locale: "es_CO",
    type: "website",
  },
};

const config: EventPageConfig = {
  hero: {
    image:
      "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2931.jpg",
    tagline: "Revelación de Género · Hacienda El Encanto · Cota, Cundinamarca",
    title: "El momento más esperado",
    subtitle:
      "Revela el gran secreto rodeado de quienes más amas, en un espacio lleno de color, alegría y naturaleza.",
    ctaLabel: "Cuéntanos tu revelación",
  },
  experiencia: {
    supertitle: "La experiencia",
    title: "Un momento único que merece celebrarse",
    paragraphs: [
      "La revelación de género es uno de los momentos más emocionantes de la vida familiar. En Hacienda El Encanto creamos el escenario perfecto para que ese instante mágico quede grabado en el corazón de todos.",
      "Nuestros jardines y espacios ofrecen el ambiente ideal para una celebración íntima y colorida, llena de sorpresas y amor.",
    ],
    highlights: [
      { value: "Íntimo", label: "Ambiente" },
      { value: "Colorido", label: "Decoración" },
      { value: "Sorpresa", label: "Momento" },
      { value: "Familiar", label: "Celebración" },
    ],
  },
  gallery: {
    category: "revelacion",
    supertitle: "Momentos reales",
    title: "Revelaciones que emocionan",
    fallback: [
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2931.jpg",
        title: "Revelación de género",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2948.jpg",
        title: "Decoración especial",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2953-scaled.jpg",
        title: "Jardines",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2924.jpg",
        title: "El Encanto",
      },
      {
        url: "https://www.hacienda-encanto.com/wp-content/uploads/2024/12/DSC_2937.jpg",
        title: "Celebración",
      },
    ],
  },
  paquetes: {
    supertitle: "Nuestros paquetes",
    title: "Todo para el gran momento",
    subtitle:
      "Diseñamos cada detalle de la revelación para que la familia disfrute el momento sin preocupaciones.",
    eventType: "Revelación de Género",
  },
  testimonios: {
    eventType: "Revelación de Género",
    title: "Familias que vivieron su revelación en El Encanto",
  },
  contacto: {
    defaultEventType: "Revelación de Género",
    title: "Cuéntanos tu revelación",
    subtitle:
      "Comparte los detalles de la celebración y nos pondremos en contacto contigo en menos de 24 horas.",
  },
};

export default function RevelacionDeGeneroPage() {
  return <EventPageTemplate config={config} />;
}
