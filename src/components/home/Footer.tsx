import Link from "next/link";

const eventLinks = [
  { href: "/bodas", label: "Bodas" },
  { href: "/quince-anos", label: "Quince Años" },
  { href: "/empresariales", label: "Empresariales" },
  { href: "/revelacion", label: "Revelación de Género" },
];

const encanto = [
  { href: "#nosotros", label: "Nosotros" },
  { href: "#servicios", label: "Servicios" },
  { href: "#galeria", label: "Galería" },
  { href: "#testimonios", label: "Testimonios" },
];

const contacto = [
  "+57 324 783 6852",
  "contacto@hacienda-encanto.com",
  "Vía Suba Km 5.5, Cota",
  "@haciendaelencanto",
];

const social = [
  { label: "IG", href: "https://instagram.com/haciendaelencanto" },
  { label: "FB", href: "#" },
  { label: "WA", href: "https://wa.me/573247836852" },
];

export function Footer() {
  return (
    <footer className="bg-negro pt-16 pb-8 text-gris">
      <div className="max-w-[1200px] mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-12 mb-12">
          {/* Marca */}
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-principal-fondo-claro.svg"
              alt="El Encanto"
              style={{ height: "36px", width: "auto" }}
              className="mb-4 brightness-0 invert"
            />
            <p className="text-[0.85rem] text-gris leading-[1.7] font-light max-w-[280px]">
              Creamos experiencias únicas para los momentos más importantes de tu
              vida. Cada celebración en El Encanto es una historia que merece
              contarse.
            </p>
          </div>

          {/* Eventos */}
          <div>
            <h4 className="text-[11px] tracking-[3px] uppercase text-dorado font-light mb-4">
              Eventos
            </h4>
            <ul className="space-y-2">
              {eventLinks.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[0.85rem] text-gris hover:text-crema transition-colors duration-300 font-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* El Encanto */}
          <div>
            <h4 className="text-[11px] tracking-[3px] uppercase text-dorado font-light mb-4">
              El Encanto
            </h4>
            <ul className="space-y-2">
              {encanto.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[0.85rem] text-gris hover:text-crema transition-colors duration-300 font-light"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-[11px] tracking-[3px] uppercase text-dorado font-light mb-4">
              Contacto
            </h4>
            <ul className="space-y-2">
              {contacto.map((t) => (
                <li key={t} className="text-[0.85rem] text-gris font-light">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Pie */}
        <div className="border-t border-blanco/[0.06] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[0.8rem] text-gris font-light">
            © 2026 Hacienda El Encanto. Todos los derechos reservados.
          </p>
          <div className="flex gap-3">
            {social.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-blanco/10 flex items-center justify-center text-gris text-sm hover:border-dorado hover:text-dorado transition-all duration-300"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
