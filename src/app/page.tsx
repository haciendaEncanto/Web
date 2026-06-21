import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/home/NavBar";
import { HeroSection } from "@/components/home/HeroSection";
import { EventosSection } from "@/components/home/EventosSection";
import { NosotrosSection } from "@/components/home/NosotrosSection";
import { ServiciosSection } from "@/components/home/ServiciosSection";
import { GaleriaSection } from "@/components/home/GaleriaSection";
import { TestimoniosSection } from "@/components/home/TestimoniosSection";
import { CTASection } from "@/components/home/CTASection";
import { ContactoSection } from "@/components/home/ContactoSection";
import { Footer } from "@/components/home/Footer";
import { WhatsAppButton } from "@/components/home/WhatsAppButton";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: testimonials }, { data: heroVideos }] = await Promise.all([
    supabase
      .from("testimonials")
      .select("client_name, event_type, rating, content")
      .eq("is_published", true)
      .order("sort_order"),
    supabase
      .from("hero_videos")
      .select("url, thumbnail_url")
      .eq("is_active", true)
      .order("sort_order"),
  ]);

  return (
    <>
      <NavBar />
      <main className="pt-[72px]">
        <HeroSection videos={heroVideos ?? []} />
        <EventosSection />
        <NosotrosSection />
        <ServiciosSection />
        <GaleriaSection />
        <TestimoniosSection testimonials={testimonials ?? []} />
        <CTASection />
        <ContactoSection />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
