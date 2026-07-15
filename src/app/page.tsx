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
  const supabase = await createClient();

  const [{ data: testimonials }, { data: heroVideos }, { data: sliderImagesRaw }, { data: siteImageRows }] =
    await Promise.all([
      supabase
        .from("testimonials")
        .select("client_name, event_type, rating, content, photo_url")
        .eq("is_published", true)
        .order("sort_order"),
      supabase
        .from("hero_videos")
        .select("url, thumbnail_url")
        .eq("is_active", true)
        .is("event_type", null)
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

  const sliderImages = pickRandomSliderImages(sliderImagesRaw ?? []);

  const siteImages = Object.fromEntries(
    SITE_IMAGE_KEYS.map((k) => [k, null]),
  ) as Record<SiteImageKey, string | null>;
  for (const row of siteImageRows ?? []) {
    if (SITE_IMAGE_KEYS.includes(row.key as SiteImageKey)) {
      siteImages[row.key as SiteImageKey] = row.content;
    }
  }

  return (
    <>
      <NavBar />
      <main className="pt-[72px]">
        <HeroSection videos={heroVideos ?? []} />
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
          images={sliderImages ?? []}
          supertitle="Momentos reales"
          title="Así vivimos los eventos"
        />
        <TestimoniosSection testimonials={testimonials ?? []} />
        <CTASection />
        <ContactoSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
