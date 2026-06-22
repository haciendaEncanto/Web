@AGENTS.md

---

## Estado del proyecto — Hacienda El Encanto

### Fases completadas

| Fase | Descripción | Estado |
|---|---|---|
| **Fase 0** | Entorno: Next.js 16 + TypeScript + Tailwind v4 + Supabase conectado, paleta de marca en globals.css, fuentes Cormorant Garamond, ramas main/develop en GitHub | ✅ |
| **Fase 1** | Base de datos: 15 tablas con RLS, 2 buckets públicos (gallery, videos), 2 privados (documents, avatars), seed de testimonios, contenido del sitio y espacio principal | ✅ |
| **Fase 2** | Auth: proxy.ts protege /portal y /admin, páginas login/registro con identidad de marca, Server Action de contacto con Zod + reCAPTCHA v3 | ✅ |
| **Fase 3** | Home público (/): NavBar fijo, Hero con video, Eventos (4 cards), Nosotros + stats, Servicios (3 cards), Galería (grid masonry), Testimonios (desde BD), CTA, Formulario de contacto, Footer, botón WhatsApp flotante | ✅ |
| **Fase 4** | Páginas de tipos de evento: `EventPageTemplate` reutilizable + 4 rutas completas (`/bodas`, `/quince-anos`, `/eventos-empresariales`, `/revelacion-de-genero`), 12 paquetes en BD con `event_type`, galería filtrada por categoría, testimonios filtrados por tipo, formulario con tipo prellenado | ✅ |

### Decisiones de arquitectura

- **Sin API Routes** — todas las mutaciones usan Server Actions (`src/app/actions/`). API Routes solo si se necesitan webhooks externos en el futuro.
- **Rutas protegidas**: `/portal` (clientes) y `/admin` (staff/admin). Nunca `/dashboard`.
- **Sin precios públicos** — los paquetes en el sitio muestran nombre + qué incluye. El CTA siempre es "Cuéntanos tu evento" o "Conoce más". Los precios se discuten privadamente con cada cliente.
- **Rol staff** existe en el esquema (`profiles.role`): puede gestionar reservas pero no eliminar ni modificar contenido del sitio.
- **middleware** → renombrado a `proxy.ts` / función `proxy` (breaking change Next.js 16).
- **reCAPTCHA v3** en el formulario de contacto público: token en cliente → verificación server-side en la Server Action. Se omite en dev si `RECAPTCHA_SECRET_KEY` no está configurada.
- **Supabase SSR**: `createServerClient` en proxy.ts, `createClient()` (async) en server.ts para Server Components y Actions, `createBrowserClient` para client.ts.
- **Logos y assets locales** (SVG) se sirven desde `public/` con `<img>` directo — no `next/image` para SVGs.
- **Tailwind v4**: config via `@theme inline {}` en globals.css. Variables de color: `--rojo`, `--dorado`, `--crema`, `--negro`, `--verde-bosque`, `--blush`, etc.
- **EventPageTemplate** (Server Component async) — patrón para páginas de eventos: cada `page.tsx` define un `EventPageConfig` estático y delega fetch + render al template. Fetch paralelo de galería, paquetes y testimonios.
- **packages.event_type** — columna `text` añadida en migración `20260621000000`. 12 paquetes (3 × 4 tipos de evento). Los paquetes del mismo nombre (Esencial, Premium, Gran Gala) tienen contenido específico por tipo: lenguaje de bodas ≠ corporativo ≠ quince ≠ revelación.
- **Gestión de paquetes**: `pnpm` exclusivamente (pnpm-lock.yaml). Nunca `npm install`.
- **Tipos Supabase**: regenerar con `supabase gen types typescript --project-id oewqyckeqolrpjbjevap > src/types/database.ts` después de cada migración.
- **Hero overlays**: capa base `bg-negro/50` + gradiente encima. Text-shadow en tagline y H1 para legibilidad en cualquier imagen de fondo.

### Pendiente — próximos pasos

1. **Imágenes reales por tipo de evento** — subir fotos de bodas, quinces, empresariales y revelación al bucket `gallery` en Supabase Storage e insertarlas en `gallery_images` con la `category` correspondiente (`boda`, `quince`, `empresarial`, `revelacion`). Mientras tanto las páginas usan imágenes de placeholder del WordPress anterior.

2. **Subir video real a Supabase Storage** — el bucket `videos` está creado. Insertar la URL en `hero_videos` con `is_active = true` y `sort_order` para que el HeroSection del Home lo cargue dinámicamente desde la BD.

3. **Ajustar contenido de paquetes con el cliente** — los 12 paquetes actuales son placeholders funcionales (capacidad 150 personas, servicios genéricos). Refinar nombre, descripción e `includes` según lo que realmente ofrece El Encanto por tipo de evento.

4. **Portal de clientes** (`/portal`) — dashboard con reservas propias, documentos adjuntos, mensajería con el equipo.

5. **Panel de administración** (`/admin`) — gestión de reservas, mensajes de contacto, contenido del sitio, galería.

### Archivos clave

```
src/
  app/
    page.tsx                           ← Home público (Server Component, fetch paralelo)
    bodas/page.tsx                     ← Página Bodas (EventPageConfig + EventPageTemplate)
    quince-anos/page.tsx               ← Página Quinceañeras
    eventos-empresariales/page.tsx     ← Página Eventos Empresariales
    revelacion-de-genero/page.tsx      ← Página Revelación de Género
    actions/
      auth.ts                          ← login, register, logout
      contact.ts                       ← submitContactForm (Zod + reCAPTCHA + Supabase insert)
    (auth)/
      login/page.tsx
      registro/page.tsx
  components/
    home/                              ← 11 componentes del Home
    events/                            ← Template y componentes de páginas de evento
      types.ts                         ← EventPageConfig (interfaz de configuración)
      EventPageTemplate.tsx            ← Server Component async: fetch paralelo + render
      EventHero.tsx                    ← Hero con imagen estática + overlay + text-shadow
      EventDescripcion.tsx             ← Experiencia: texto + 4 highlights en serif
      EventGaleria.tsx                 ← Grid masonry filtrado por category
      EventPaquetes.tsx                ← Cards sin precio (nombre + includes con ✦)
      EventTestimonios.tsx             ← Testimonios filtrados por event_type
      EventContacto.tsx                ← Sección contacto (form + info + mapa)
      EventContactForm.tsx             ← "use client" — form con defaultEventType prellenado
    contact/
      ContactForm.tsx                  ← Formulario genérico (para reusar)
      HomeContactForm.tsx              ← Formulario del Home (campos extra: fecha, invitados)
    ui/
      SubmitButton.tsx                 ← useFormStatus pending state
  lib/supabase/
    server.ts                          ← createClient() async, Server Components
    client.ts                          ← createBrowserClient, Client Components
  proxy.ts                             ← Middleware Next.js 16 (protege /portal y /admin)
  types/
    database.ts                        ← Tipos generados: supabase gen types typescript
    recaptcha.d.ts                     ← Tipos globales window.grecaptcha
public/
  logo-principal-fondo-claro.svg
  trebol-original.svg                  ← Favicon configurado en layout.tsx metadata.icons
supabase/migrations/
  20260620000000_initial_schema.sql
  20260620000001_storage_buckets.sql
  20260620000002_seed_testimonials.sql
  20260620000003_seed_site_content.sql
  20260620000004_seed_spaces.sql
  20260621000000_seed_packages.sql     ← ALTER TABLE packages ADD COLUMN event_type + 12 paquetes
.tmp/
  check-event-pages.mjs                ← Script Playwright para verificar las 4 páginas de eventos
```
