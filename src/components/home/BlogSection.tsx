import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

type BlogPost = {
  id: string;
  titulo: string;
  slug: string;
  resumen: string | null;
  foto_url: string | null;
  published_at: string | null;
};

const FALLBACK_POSTS: BlogPost[] = [
  {
    id: "fb0",
    titulo: "Mis XV 2026: Las tendencias que están arrasando",
    slug: "mis-xv-2026-tendencias-que-estan-arrasando",
    resumen: "Descubre las 5 tendencias que están definiendo las quinceañeras este año y encuentra la que habla de ti.",
    foto_url: "https://contenido.hacienda-encanto.com/galeria/quince/9.png",
    published_at: "2026-08-18T00:00:00Z",
  },
  {
    id: "fb1",
    titulo: "Cómo elegir el lugar perfecto para tu boda",
    slug: "como-elegir-el-lugar-perfecto-para-tu-boda",
    resumen: "Descubre los factores clave que debes considerar al seleccionar el espacio ideal para el día más especial de tu vida.",
    foto_url: "https://contenido.hacienda-encanto.com/galeria/boda/1.jpeg",
    published_at: "2026-07-15T00:00:00Z",
  },
  {
    id: "fb2",
    titulo: "Tendencias en decoración para quinceañeras 2026",
    slug: "tendencias-decoracion-quinceaneras-2026",
    resumen: "Las tendencias más elegantes y sofisticadas para celebrar los 15 años con un estilo único y memorable.",
    foto_url: "https://contenido.hacienda-encanto.com/galeria/quince/1.jpeg",
    published_at: "2026-07-01T00:00:00Z",
  },
];

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export function BlogSection({ posts }: { posts: BlogPost[] }) {
  const effectivePosts = posts.length > 0 ? posts : FALLBACK_POSTS;

  return (
    <section id="blog" className="py-20 bg-crema">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Encabezado */}
        <div className="text-center mb-14">
          <p className="text-[11px] tracking-[4px] uppercase text-dorado font-medium mb-2">
            Blog
          </p>
          <h2 className="font-serif text-[2.4rem] md:text-[3rem] font-light text-negro tracking-[-0.03em] leading-[1.1]">
            El Encanto{" "}
            <em className="text-dorado not-italic">del Detalle</em>
          </h2>
          <div className="w-[50px] h-px bg-dorado mx-auto mt-6" />
        </div>

        {/* Grid de artículos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {effectivePosts.map((post) => (
            <article
              key={post.id}
              className="bg-blanco rounded-2xl overflow-hidden border border-negro/[0.06] flex flex-col group hover:shadow-md transition-shadow duration-300"
            >
              {/* Imagen */}
              <div className="aspect-[4/3] overflow-hidden bg-dorado/5">
                {post.foto_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.foto_url}
                    alt={post.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={40} className="text-dorado/30" />
                  </div>
                )}
              </div>

              {/* Contenido */}
              <div className="p-5 flex flex-col flex-1">
                {post.published_at && (
                  <p className="text-[0.72rem] text-negro/40 tracking-wide uppercase mb-2">
                    {formatDate(post.published_at)}
                  </p>
                )}
                <h3 className="font-serif text-[1.05rem] text-negro font-normal leading-snug mb-2 line-clamp-2">
                  {post.titulo}
                </h3>
                {post.resumen && (
                  <p className="text-[0.82rem] text-negro/55 leading-relaxed line-clamp-3 mb-4">
                    {post.resumen}
                  </p>
                )}
                <div className="mt-auto">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 text-[0.8rem] font-medium text-dorado hover:text-dorado/70 transition-colors"
                  >
                    Leer más <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Ver todos */}
        <div className="text-center mt-10">
          <Link
            href="/blog"
            className="inline-block px-8 py-3 border-2 border-dorado text-dorado text-[0.8rem] font-medium tracking-[1.5px] uppercase rounded-lg hover:bg-dorado hover:text-blanco transition-all duration-300"
          >
            Ver todos los artículos
          </Link>
        </div>
      </div>
    </section>
  );
}
