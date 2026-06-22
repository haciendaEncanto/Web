import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/home/NavBar";
import { Footer } from "@/components/home/Footer";
import { WhatsAppButton } from "@/components/home/WhatsAppButton";
import { EventHero } from "./EventHero";
import { EventDescripcion } from "./EventDescripcion";
import { EventGaleria } from "./EventGaleria";
import { EventPaquetes } from "./EventPaquetes";
import { EventTestimonios } from "./EventTestimonios";
import { EventContacto } from "./EventContacto";
import type { EventPageConfig } from "./types";

export async function EventPageTemplate({ config }: { config: EventPageConfig }) {
  const supabase = await createClient();

  const [
    { data: galleryImages },
    { data: rawPackages },
    { data: testimonials },
  ] = await Promise.all([
    supabase
      .from("gallery_images")
      .select("url, title")
      .eq("is_published", true)
      .eq("category", config.gallery.category)
      .order("sort_order")
      .limit(5),
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
  ]);

  const displayImages = galleryImages?.length ? galleryImages : config.gallery.fallback;

  const packages = (rawPackages ?? []).map((p) => ({
    ...p,
    includes: Array.isArray(p.includes) ? (p.includes as string[]) : [],
  }));

  return (
    <>
      <NavBar />
      <main className="pt-[72px]">
        <EventHero {...config.hero} />
        <EventDescripcion config={config.experiencia} />
        <EventGaleria images={displayImages} config={config.gallery} />
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
