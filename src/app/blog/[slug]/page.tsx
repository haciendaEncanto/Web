import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NavBar } from "@/components/home/NavBar";
import { Footer } from "@/components/home/Footer";
import { WhatsAppButton } from "@/components/home/WhatsAppButton";

type Post = {
  id: string;
  titulo: string;
  slug: string;
  resumen: string | null;
  contenido: string | null;
  foto_url: string | null;
  autor: string | null;
  published_at: string | null;
};

type PostCard = Pick<Post, "id" | "titulo" | "slug" | "foto_url" | "published_at">;

const FALLBACK_POSTS: Post[] = [
  {
    id: "fb1",
    titulo: "Cómo elegir el lugar perfecto para tu boda",
    slug: "como-elegir-el-lugar-perfecto-para-tu-boda",
    resumen: "Descubre los factores clave que debes considerar al seleccionar el espacio ideal para el día más especial de tu vida.",
    contenido: "Elegir el lugar de tu boda es una de las decisiones más importantes que tomarás en la planificación de tu gran día. El espacio que elijas no solo determinará la estética de tu celebración, sino también el ambiente y la experiencia que tú y tus invitados vivirán.\n\nEn primer lugar, considera la capacidad del lugar. Es fundamental que el espacio pueda albergar cómodamente a todos tus invitados, ya sea en un banquete sentado o en un cóctel. Un lugar demasiado pequeño puede hacer que la celebración se sienta aglomerada, mientras que uno muy grande puede restarle intimidad.\n\nLa ubicación también es clave. Piensa en la accesibilidad para tus invitados: ¿está cerca de hoteles? ¿Tiene estacionamiento? En Hacienda El Encanto, ubicados en Cota, Cundinamarca, ofrecemos el equilibrio perfecto entre tranquilidad rural y cercanía a Bogotá.\n\nFinalmente, no subestimes la importancia del entorno natural. Un jardín exuberante, una vista montañosa o un paisaje verde pueden transformar por completo la experiencia de tu boda, creando el telón de fondo perfecto para tus fotografías y recuerdos.",
    foto_url: "https://contenido.hacienda-encanto.com/galeria/boda/1.jpeg",
    autor: "Equipo El Encanto",
    published_at: "2026-07-15T00:00:00Z",
  },
  {
    id: "fb2",
    titulo: "Tendencias en decoración para quinceañeras 2026",
    slug: "tendencias-decoracion-quinceaneras-2026",
    resumen: "Las tendencias más elegantes y sofisticadas para celebrar los 15 años con un estilo único y memorable.",
    contenido: "El año 2026 trae consigo una renovación en las tendencias de decoración para quinceañeros, alejándose de lo exuberante para abrazar la elegancia minimalista con toques de naturaleza.\n\nLas paletas de colores neutros continúan siendo protagonistas: el blanco roto, el champán y el rosa nude combinados con dorados cálidos crean ambientes sofisticados y atemporales. Esta combinación permite que la quinceañera sea el centro de atención sin competir con la decoración.\n\nLos arreglos florales con flores secas y pampas grass han ganado enorme popularidad. No solo son más económicos que las flores frescas, sino que también añaden una textura orgánica y romántica que complementa perfectamente los espacios naturales como el de Hacienda El Encanto.\n\nLa iluminación también juega un papel fundamental. Las luces cálidas tipo fairy lights, las velas y las guirnaldas de luces crean una atmósfera mágica que transforma cualquier espacio al caer la noche, perfecta para los momentos más emotivos de la celebración.",
    foto_url: "https://contenido.hacienda-encanto.com/galeria/quince/1.jpeg",
    autor: "Equipo El Encanto",
    published_at: "2026-07-01T00:00:00Z",
  },
  {
    id: "fb3",
    titulo: "Eventos empresariales en la naturaleza: una experiencia diferente",
    slug: "eventos-empresariales-en-la-naturaleza",
    resumen: "Por qué llevar tus reuniones y eventos corporativos a un entorno natural puede transformar los resultados de tu equipo.",
    contenido: "Cada vez más empresas descubren los beneficios de realizar sus eventos corporativos fuera de las oficinas y espacios urbanos tradicionales. La naturaleza ofrece un entorno que estimula la creatividad, reduce el estrés y fomenta la cohesión de equipo.\n\nLos estudios demuestran que el contacto con espacios verdes reduce los niveles de cortisol y mejora la concentración. Un equipo más tranquilo y enfocado produce mejores ideas y toma mejores decisiones. Esto hace que las retreats empresariales y conferencias en entornos naturales sean una inversión con retorno tangible.\n\nEn Hacienda El Encanto contamos con espacios versátiles que se adaptan a diferentes formatos: desde conferencias para 50 personas hasta teambuilding para equipos de trabajo, pasando por cenas de gala corporativas o lanzamientos de productos.\n\nNuestro equipo de coordinación puede ayudarte a diseñar una experiencia a medida que combine las actividades de negocio con momentos de esparcimiento y conexión con la naturaleza. El resultado: un equipo más motivado y relaciones laborales más sólidas.",
    foto_url: "https://contenido.hacienda-encanto.com/galeria/boda/3.jpeg",
    autor: "Equipo El Encanto",
    published_at: "2026-06-15T00:00:00Z",
  },
];

async function getPost(slug: string): Promise<Post | null> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = supabase;
    const { data } = await db
      .from("blog_posts")
      .select("id,titulo,slug,resumen,contenido,foto_url,autor,published_at")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();
    if (data) return data as Post;
  } catch {
    // Supabase no disponible
  }
  return FALLBACK_POSTS.find((p) => p.slug === slug) ?? null;
}

async function getOtherPosts(excludeSlug: string): Promise<PostCard[]> {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db: any = supabase;
    const { data } = await db
      .from("blog_posts")
      .select("id,titulo,slug,foto_url,published_at")
      .eq("is_published", true)
      .neq("slug", excludeSlug)
      .order("published_at", { ascending: false });
    if (data && (data as PostCard[]).length > 0) return data as PostCard[];
  } catch {
    // Supabase no disponible
  }
  return FALLBACK_POSTS
    .filter((p) => p.slug !== excludeSlug)
    .map(({ id, titulo, slug, foto_url, published_at }) => ({ id, titulo, slug, foto_url, published_at }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Artículo no encontrado — Hacienda El Encanto" };
  return {
    title: `${post.titulo} — Blog El Encanto`,
    description: post.resumen ?? undefined,
    openGraph: post.foto_url ? { images: [{ url: post.foto_url }] } : undefined,
  };
}

function formatDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatDateShort(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, otherPosts] = await Promise.all([
    getPost(slug),
    getOtherPosts(slug),
  ]);
  if (!post) notFound();

  const paragraphs = post.contenido
    ? post.contenido.split(/\n\n+/).filter(Boolean)
    : [];

  return (
    <>
      <NavBar />
      <main className="pt-[72px]">
        {/* Imagen hero del artículo */}
        {post.foto_url ? (
          <div className="w-full h-[50vh] overflow-hidden bg-negro">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.foto_url}
              alt={post.titulo}
              className="w-full h-full object-cover opacity-80"
            />
          </div>
        ) : (
          <div className="w-full h-[25vh] bg-negro flex items-center justify-center">
            <BookOpen size={56} className="text-dorado/30" />
          </div>
        )}

        {/* Contenido + Sidebar */}
        <div className="bg-crema py-14 px-6">
          <div className="max-w-[1200px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

              {/* ── Artículo principal ── */}
              <div className="flex-1 min-w-0 max-w-[720px]">
                {/* Volver */}
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-[0.78rem] text-negro/45 hover:text-dorado transition-colors mb-8"
                >
                  <ArrowLeft size={13} /> Volver al blog
                </Link>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-[0.75rem] text-negro/40 mb-5">
                  {post.published_at && (
                    <span className="flex items-center gap-1">
                      <CalendarDays size={13} />
                      {formatDate(post.published_at)}
                    </span>
                  )}
                  {post.autor && (
                    <span className="flex items-center gap-1">
                      <User size={13} />
                      {post.autor}
                    </span>
                  )}
                </div>

                {/* Título */}
                <h1 className="font-serif text-[2.2rem] md:text-[2.8rem] font-light text-negro tracking-[-0.03em] leading-[1.15] mb-6">
                  {post.titulo}
                </h1>

                {post.resumen && (
                  <>
                    <div className="w-[40px] h-px bg-dorado mb-6" />
                    <p className="text-[1rem] text-negro/65 font-light leading-[1.7] mb-6 italic">
                      {post.resumen}
                    </p>
                  </>
                )}

                {/* Contenido */}
                {paragraphs.length > 0 && (
                  <div className="mt-8 space-y-5">
                    {paragraphs.map((para, i) => (
                      <p
                        key={i}
                        className="text-[0.95rem] text-negro/75 leading-[1.8] font-light"
                      >
                        {para}
                      </p>
                    ))}
                  </div>
                )}

                {/* CTA */}
                <div className="mt-14 pt-10 border-t border-dorado/20 text-center">
                  <p className="text-[0.88rem] text-negro/55 mb-4">
                    ¿Listo para vivir tu propio evento en El Encanto?
                  </p>
                  <Link
                    href="/#contacto"
                    className="inline-block px-8 py-3 bg-rojo text-blanco text-[0.8rem] font-medium tracking-[1.5px] uppercase rounded-lg border-2 border-rojo hover:bg-rojo/90 transition-all duration-300"
                  >
                    Cuéntanos tu evento
                  </Link>
                </div>
              </div>

              {/* ── Sidebar: más artículos ── */}
              {otherPosts.length > 0 && (
                <aside className="w-full lg:w-[270px] shrink-0 lg:sticky lg:top-[100px]">
                  <h3 className="text-[0.65rem] tracking-[3px] uppercase text-dorado font-medium mb-5">
                    Más artículos
                  </h3>
                  <div className="space-y-4">
                    {otherPosts.map((p) => (
                      <Link
                        key={p.id}
                        href={`/blog/${p.slug}`}
                        className="flex gap-3 group"
                      >
                        {/* Miniatura */}
                        <div className="w-16 h-14 rounded-lg overflow-hidden bg-dorado/10 shrink-0">
                          {p.foto_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.foto_url}
                              alt={p.titulo}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen size={14} className="text-dorado/30" />
                            </div>
                          )}
                        </div>
                        {/* Texto */}
                        <div className="flex-1 min-w-0">
                          <p className="text-[0.82rem] text-negro font-medium leading-snug line-clamp-2 group-hover:text-dorado transition-colors">
                            {p.titulo}
                          </p>
                          {p.published_at && (
                            <p className="text-[0.68rem] text-negro/35 mt-1">
                              {formatDateShort(p.published_at)}
                            </p>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>

                  <div className="mt-6 pt-5 border-t border-dorado/15">
                    <Link
                      href="/blog"
                      className="text-[0.75rem] text-dorado hover:text-dorado/70 transition-colors"
                    >
                      Ver todos los artículos →
                    </Link>
                  </div>
                </aside>
              )}

            </div>
          </div>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}
