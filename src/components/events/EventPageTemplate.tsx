import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/home/NavBar";
import { NosotrosSection } from "@/components/home/NosotrosSection";
import { Footer } from "@/components/home/Footer";
import { WhatsAppButton } from "@/components/home/WhatsAppButton";
import { SliderGaleria } from "@/components/ui/SliderGaleria";
import { EventHero } from "./EventHero";
import { EventDescripcion } from "./EventDescripcion";
import { EventTestimonios } from "./EventTestimonios";
import { EventContacto } from "./EventContacto";
import { Vista360 } from "./Vista360";
import type { EventPageConfig } from "./types";

export async function EventPageTemplate({ config }: { config: EventPageConfig }) {
  // TEMPORAL: Supabase Storage con quota excedida — URLs hardcodeadas en Colombia Hosting
  // Restaurar query cuando se renueve la quota:
  // supabase.from("hero_videos").select("url").eq("event_type",config.hero.videoEventType)...
  const HERO_VIDEOS_TEMP: Record<string, string | null> = {
    boda:        "https://contenido.hacienda-encanto.com/videos/Nuevo_Boda_optimizado.mp4",
    quince:      "https://contenido.hacienda-encanto.com/videos/Quince_optimizado.mp4",
    empresarial: null,
    revelacion:  null,
  };
  const HERO_MOBILE_VIDEOS_TEMP: Record<string, string | null> = {
    boda:        "https://contenido.hacienda-encanto.com/videos/Nuevo_Boda_mobile.mp4",
    quince:      "https://contenido.hacienda-encanto.com/videos/Quince_mobile.mp4",
    empresarial: null,
    revelacion:  null,
  };
  const heroVideoUrl = HERO_VIDEOS_TEMP[config.hero.videoEventType] ?? null;
  const heroMobileVideoUrl = HERO_MOBILE_VIDEOS_TEMP[config.hero.videoEventType] ?? null;

  // Fallback: Supabase puede estar no disponible temporalmente
  type GaleriaRow = { url: string; title: string | null };
  type TestimonioRow = { client_name: string; event_type: string | null; rating: number | null; content: string; photo_url: string | null };

  let galleryImages: GaleriaRow[] = [];
  let testimonials: TestimonioRow[] = [];
  let tourUrl: string | null = null;
  let nosotrosImage: string | null = null;

  try {
    const supabase = await createClient();
    const [
      { data: galleryData },
      { data: testimonialsData },
      { data: tourContent },
      { data: nosotrosContent },
    ] = await Promise.all([
      supabase
        .from("gallery_images")
        .select("url, title")
        .eq("is_published", true)
        .eq("category", config.gallery.category)
        .order("sort_order")
        .limit(8),
      supabase
        .from("testimonials")
        .select("client_name, event_type, rating, content, photo_url")
        .eq("is_published", true)
        .eq("event_type", config.testimonios.eventType)
        .order("sort_order"),
      supabase
        .from("site_content")
        .select("content")
        .eq("key", "tour_360_url")
        .maybeSingle(),
      supabase
        .from("site_content")
        .select("content")
        .eq("key", "img_nosotros")
        .maybeSingle(),
    ]);

    galleryImages = galleryData ?? [];
    testimonials = testimonialsData ?? [];
    tourUrl = tourContent?.content ?? null;
    nosotrosImage = nosotrosContent?.content ?? null;
  } catch {
    // Supabase no disponible — se usan fallbacks de config y secciones vacías
  }

  const allImages = galleryImages.length ? galleryImages : config.gallery.fallback;

  return (
    <>
      <NavBar />
      <main className="pt-[72px]">
        {/* 1. Hero */}
        <EventHero {...config.hero} videoUrl={heroVideoUrl} mobileVideoUrl={heroMobileVideoUrl} />

        {/* 2. Experiencia — párrafo emocional centrado */}
        <EventDescripcion config={config.experiencia} />

        {/* 3. Vista 360° */}
        <Vista360 tourUrl={tourUrl} />

        {/* 4. Galería */}
        <div id="galeria">
          <SliderGaleria
            images={allImages}
            supertitle={config.gallery.supertitle}
            title={config.gallery.title}
          />
        </div>

        {/* 5. Nuestra historia */}
        <NosotrosSection image={nosotrosImage} />

        {/* 6. Testimonios */}
        <EventTestimonios
          testimonials={testimonials}
          title={config.testimonios.title}
        />

        {/* 7. Formulario de contacto */}
        <EventContacto config={config.contacto} />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
