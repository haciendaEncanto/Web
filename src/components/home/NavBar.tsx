"use client";

import Link from "next/link";

const links = [
  { href: "/bodas", label: "Bodas" },
  { href: "/quince-anos", label: "Quince Años" },
  { href: "/eventos-empresariales", label: "Eventos Empresariales" },
  { href: "/revelacion-de-genero", label: "Revelación de Género" },
];

export function NavBar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] py-4 bg-crema/95 backdrop-blur-md border-b border-black/[0.04]">
      <div className="max-w-[1200px] mx-auto px-8 flex items-center justify-between">
        <Link href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-principal-fondo-claro.svg"
            alt="Hacienda El Encanto"
            style={{ height: "42px", width: "auto" }}
          />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-rojo font-medium text-sm">
            Inicio
          </Link>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-gris text-sm hover:text-rojo transition-colors duration-300 tracking-[0.3px]"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="#contacto"
            className="bg-rojo text-blanco text-[12px] tracking-[1px] uppercase px-5 py-2 rounded-md hover:bg-rojo-pro transition-colors duration-300"
          >
            Contáctanos
          </Link>
        </div>
      </div>
    </nav>
  );
}
