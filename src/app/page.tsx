import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/home/NavBar";
import { HeroSection } from "@/components/home/HeroSection";
import { EventosSection } from "@/components/home/EventosSection";
import { NosotrosSection } from "@/components/home/NosotrosSection";
import { ServiciosSection } from "@/components/home/ServiciosSection";
import { TestimoniosSection } from "@/components/home/TestimoniosSection";
import { CTASection } from "@/components/home/CTASection";
import { ContactoSection } from "@/components/home/ContactoSection";
import { Footer } from "@/components/home/Footer";
import { WhatsAppButton } from "@/components/home/WhatsAppButton";
import { SliderGaleria } from "@/components/ui/SliderGaleria";
import { pickRandomSliderImages } from "@/lib/random-slider";
import { SITE_IMAGE_KEYS, type SiteImageKey } from "@/lib/uploads/config";

export default async function HomePage() {
  // TEMPORAL: Supabase Storage con quota excedida — URLs hardcodeadas en Colombia Hosting
  // Restaurar query cuando se renueve la quota:
  // supabase.from("hero_videos").select("url,thumbnail_url").eq("is_active",true).is("event_type",null).order("sort_order")
  const heroVideos = [
    { url: "https://contenido.hacienda-encanto.com/videos/Nuevo_Home_optimizado.mp4", thumbnail_url: null },
  ];

  // Fallback: Supabase no disponible hasta el 20 de agosto — secciones quedan vacías pero el sitio no cae
  type TestimonioRow = { client_name: string; event_type: string | null; rating: number | null; content: string; photo_url: string | null };
  let testimonials: TestimonioRow[] = [];
  let sliderImages: { url: string; title: string | null }[] = [];
  const siteImages = Object.fromEntries(
    SITE_IMAGE_KEYS.map((k) => [k, null]),
  ) as Record<SiteImageKey, string | null>;

  try {
    const supabase = await createClient();
    const [{ data: testimonialsData }, { data: sliderImagesRaw }, { data: siteImageRows }] =
      await Promise.all([
        supabase
          .from("testimonials")
          .select("client_name, event_type, rating, content, photo_url")
          .eq("is_published", true)
          .order("sort_order"),
        supabase
          .from("gallery_images")
          .select("url, title, category")
          .eq("is_published", true)
          .in("category", ["boda", "quince", "empresarial", "revelacion"]),
        supabase
          .from("site_content")
          .select("key, content")
          .in("key", SITE_IMAGE_KEYS),
      ]);

    testimonials = testimonialsData ?? [];
    sliderImages = pickRandomSliderImages(sliderImagesRaw ?? []);
    for (const row of siteImageRows ?? []) {
      if (SITE_IMAGE_KEYS.includes(row.key as SiteImageKey)) {
        siteImages[row.key as SiteImageKey] = row.content;
      }
    }
  } catch {
    // Supabase no disponible — el sitio sigue funcionando con videos hardcodeados y secciones vacías
  }

  // Si Supabase no devolvió imágenes, usar imágenes reales de Colombia Hosting como fallback
  if (sliderImages.length === 0) {
    sliderImages = [
      { url: "https://contenido.hacienda-encanto.com/galeria/boda/1.jpeg",   title: "Boda El Encanto" },
      { url: "https://contenido.hacienda-encanto.com/galeria/quince/1.jpeg", title: "Quinceañera El Encanto" },
      { url: "https://contenido.hacienda-encanto.com/galeria/boda/2.jpeg",   title: "Boda El Encanto" },
      { url: "https://contenido.hacienda-encanto.com/galeria/quince/2.jpeg", title: "Quinceañera El Encanto" },
      { url: "https://contenido.hacienda-encanto.com/galeria/boda/3.jpeg",   title: "Boda El Encanto" },
      { url: "https://contenido.hacienda-encanto.com/galeria/quince/3.jpeg", title: "Quinceañera El Encanto" },
      { url: "https://contenido.hacienda-encanto.com/galeria/boda/4.jpeg",   title: "Boda El Encanto" },
      { url: "https://contenido.hacienda-encanto.com/galeria/quince/4.jpeg", title: "Quinceañera El Encanto" },
    ];
  }

  return (
    <>
      <NavBar />
      <main className="pt-[72px]">
        <HeroSection videos={heroVideos} />
        <EventosSection
          images={{
            boda: siteImages.img_card_boda,
            quince: siteImages.img_card_quince,
            empresarial: siteImages.img_card_empresarial,
            revelacion: siteImages.img_card_revelacion,
          }}
        />
        <NosotrosSection image={siteImages.img_nosotros} />
        <ServiciosSection
          images={{
            catering: siteImages.img_servicio_catering,
            fotografia: siteImages.img_servicio_fotografia,
            decoracion: siteImages.img_servicio_decoracion,
          }}
        />
        <SliderGaleria
          images={sliderImages}
          supertitle="Momentos reales"
          title="Así vivimos los eventos"
        />
        <TestimoniosSection testimonials={testimonials} />
        <CTASection />
        <ContactoSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
