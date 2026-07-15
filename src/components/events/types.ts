export interface EventGalleryImage {
  url: string;
  title: string | null;
}

export interface EventPackage {
  id: string;
  name: string;
  description: string | null;
  includes: string[];
  sort_order: number;
}

export interface EventTestimonio {
  client_name: string;
  event_type: string | null;
  rating: number | null;
  content: string;
  photo_url: string | null;
}

export interface EventPageConfig {
  hero: {
    image: string;
    videoEventType: string;
    tagline: string;
    title: string;
    subtitle: string;
    ctaLabel: string;
  };
  experiencia: {
    text: string;
  };
  gallery: {
    category: string;
    supertitle: string;
    title: string;
    fallback: EventGalleryImage[];
  };
  paquetes: {
    supertitle: string;
    title: string;
    subtitle: string;
    eventType: string;
  };
  testimonios: {
    eventType: string;
    title: string;
  };
  contacto: {
    defaultEventType: string;
    title: string;
    subtitle: string;
  };
}
