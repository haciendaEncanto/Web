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

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: testimonials }, { data: heroVideos }, { data: sliderImages }] =
    await Promise.all([
      supabase
        .from("testimonials")
        .select("client_name, event_type, rating, content")
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
        .select("url, title")
        .eq("is_published", true)
        .order("sort_order")
        .limit(8),
    ]);

  return (
    <>
      <NavBar />
      <main className="pt-[72px]">
        <HeroSection videos={heroVideos ?? []} />
        <EventosSection />
        <NosotrosSection />
        <ServiciosSection />
        <TestimoniosSection testimonials={testimonials ?? []} />
        <CTASection />
        <ContactoSection />
        <SliderGaleria
          images={sliderImages ?? []}
          supertitle="Momentos reales"
          title="Así vivimos los eventos"
        />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
