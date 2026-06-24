import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/home/NavBar";
import { Footer } from "@/components/home/Footer";
import { WhatsAppButton } from "@/components/home/WhatsAppButton";
import { SliderGaleria } from "@/components/ui/SliderGaleria";
import { EventHero } from "./EventHero";
import { EventDescripcion } from "./EventDescripcion";
import { EventPaquetes } from "./EventPaquetes";
import { EventTestimonios } from "./EventTestimonios";
import { EventContacto } from "./EventContacto";
import { Vista360 } from "./Vista360";
import type { EventPageConfig } from "./types";

export async function EventPageTemplate({ config }: { config: EventPageConfig }) {
  const supabase = await createClient();

  const [
    { data: galleryImages },
    { data: rawPackages },
    { data: testimonials },
    { data: tourContent },
    { data: heroVideo },
  ] = await Promise.all([
    supabase
      .from("gallery_images")
      .select("url, title")
      .eq("is_published", true)
      .eq("category", config.gallery.category)
      .order("sort_order")
      .limit(8),
    supabase
      .from("packages")
      .select("id, name, description, includes, sort_order")
      .eq("is_active", true)
      .eq("event_type", config.paquetes.eventType)
      .order("sort_order"),
    supabase
      .from("testimonials")
      .select("client_name, event_type, rating, content")
      .eq("is_published", true)
      .eq("event_type", config.testimonios.eventType)
      .order("sort_order"),
    supabase
      .from("site_content")
      .select("content")
      .eq("key", "tour_360_url")
      .maybeSingle(),
    supabase
      .from("hero_videos")
      .select("url")
      .eq("event_type", config.hero.videoEventType)
      .eq("is_active", true)
      .order("sort_order")
      .limit(1)
      .maybeSingle(),
  ]);

  const allImages = galleryImages?.length ? galleryImages : config.gallery.fallback;

  const packages = (rawPackages ?? []).map((p) => ({
    ...p,
    includes: Array.isArray(p.includes) ? (p.includes as string[]) : [],
  }));

  return (
    <>
      <NavBar />
      <main className="pt-[72px]">
        <EventHero {...config.hero} videoUrl={heroVideo?.url ?? null} />
        <Vista360 tourUrl={tourContent?.content ?? null} />
        <EventDescripcion config={config.experiencia} />
        <SliderGaleria
          images={allImages}
          supertitle={config.gallery.supertitle}
          title={config.gallery.title}
        />
        <EventPaquetes packages={packages} config={config.paquetes} />
        <EventTestimonios
          testimonials={testimonials ?? []}
          title={config.testimonios.title}
        />
        <EventContacto config={config.contacto} />
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
