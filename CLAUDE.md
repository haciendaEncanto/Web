@AGENTS.md

---

## Estado del proyecto — Hacienda El Encanto

### Fases completadas

| Fase | Descripción | Estado |
|---|---|---|
| **Fase 0** | Entorno: Next.js 16 + TypeScript + Tailwind v4 + Supabase conectado, paleta de marca en globals.css, fuentes Cormorant Garamond, ramas main/develop en GitHub | ✅ |
| **Fase 1** | Base de datos: 15 tablas con RLS, 2 buckets públicos (gallery, videos), 2 privados (documents, avatars), seed de testimonios, contenido del sitio y espacio principal | ✅ |
| **Fase 2** | Auth: proxy.ts protege /portal y /admin, login con identidad de marca, /registro deshabilitado (redirect a /login), Server Action de contacto con Zod + reCAPTCHA v3 | ✅ |
| **Fase 3** | Home público (/): NavBar fijo + "Mi evento" dinámico por sesión, Hero con video en loop, Eventos (4 cards), Nosotros + stats responsive, Servicios (3 cards), SliderGaleria, Testimonios, CTA, Formulario de contacto, Footer, botón WhatsApp flotante | ✅ |
| **Fase 4** | Páginas de tipos de evento: `EventPageTemplate` reutilizable + 4 rutas completas (`/bodas`, `/quince-anos`, `/eventos-empresariales`, `/revelacion-de-genero`), 12 paquetes en BD con `event_type`, galería filtrada, testimonios filtrados, formulario prellenado | ✅ |
| **Ajustes post-Fase 4** | SliderGaleria (crossfade CSS, dots). Vista360 en 4 páginas. Logo SVG transparente. Mapa Google Maps real. Hero overlay `bg-negro/55` + text-shadow. `hero_videos.event_type` para videos por página. Video en loop. | ✅ |
| **Fase 5 — Esquema ampliado** | 6 roles en enum (`admin`, `wedding_planner`, `asesor_comercial`, `asesor_logistica`, `staff`, `client`). Tablas nuevas: `playlists`, `guest_tables`, `calendar_events`, `service_order_sections`, `service_order_items`. `payments.receipt_url` para comprobante PDF. | ✅ |
| **Fase 6 — Portal base** | Layout portal (`PortalShell` + `PortalSidebar` + `PortalHeader`). `/portal/page.tsx` con redirect por rol. Dashboard cliente con cuenta regresiva (`CountdownTimer`), detalles del evento y accesos rápidos. Sidebar oscuro con logo blanco (filtro CSS). Responsive: hamburger mobile, countdown adaptable, stats Nosotros mobile. | ✅ |

### Decisiones de arquitectura

- **Sin API Routes** — todas las mutaciones usan Server Actions (`src/app/actions/`). API Routes solo si se necesitan webhooks externos en el futuro.
- **Rutas protegidas**: `/portal` (todos los roles) y `/admin` (staff/admin). Nunca `/dashboard`.
- **Sin precios públicos** — los paquetes en el sitio muestran nombre + qué incluye. El CTA siempre es "Cuéntanos tu evento" o "Conoce más". Los precios se discuten privadamente con cada cliente.
- **Sin auto-registro público** — `/registro` redirige a `/login`. Las cuentas las crea el admin o wedding planner. El formulario de registro fue eliminado de la UI.
- **6 roles** — `profiles.role`: `client`, `staff`, `admin`, `wedding_planner`, `asesor_comercial`, `asesor_logistica`. Cada rol tiene un destino de redirect post-login diferente (ver `auth.ts` y `/portal/page.tsx`).
- **middleware** → renombrado a `proxy.ts` / función `proxy` (breaking change Next.js 16).
- **reCAPTCHA v3** en el formulario de contacto público: token en cliente → verificación server-side en la Server Action. Se omite en dev si `RECAPTCHA_SECRET_KEY` no está configurada.
- **Supabase SSR**: `createServerClient` en proxy.ts, `createClient()` (async) en server.ts para Server Components y Actions, `createBrowserClient` para client.ts.
- **Logos y assets locales** (SVG) se sirven desde `public/` con `<img>` directo — no `next/image` para SVGs.
- **Tailwind v4**: config via `@theme inline {}` en globals.css. Variables de color: `--rojo`, `--dorado`, `--crema`, `--negro`, `--verde-bosque`, `--blush`, etc.
- **EventPageTemplate** (Server Component async) — patrón para páginas de eventos: cada `page.tsx` define un `EventPageConfig` estático y delega fetch + render al template. Fetch paralelo de galería, paquetes y testimonios.
- **packages.event_type** — columna `text` en migración `20260621000000`. 12 paquetes (3 × 4 tipos). Los paquetes del mismo nombre tienen contenido diferente por tipo de evento.
- **Gestión de paquetes**: `pnpm` exclusivamente (pnpm-lock.yaml). Nunca `npm install`.
- **Tipos Supabase**: regenerar con `supabase gen types typescript --project-id oewqyckeqolrpjbjevap > src/types/database.ts` después de cada migración.
- **Hero overlays**: capa base `bg-negro/55` + gradiente `from-negro/30 via-negro/10 to-negro/40`. Text-shadow doble capa en tagline dorado y H1 blanco. Aplica en `HeroSection.tsx` y `EventHero.tsx`.
- **SliderGaleria** (`src/components/ui/SliderGaleria.tsx`) — client component, crossfade CSS opacity, 8 imágenes, intervalo 3.5s, dots de navegación. Fallback a 5 placeholders WP. Usado en Home y 4 páginas de evento.
- **Vista360** (`src/components/events/Vista360.tsx`) — solo en páginas de evento, después del Hero. Lee `tour_360_url` de `site_content` (maybeSingle). Botón apunta a `#` hasta que el cliente contrate Matterport/Kuula.
- **hero_videos**: columna `event_type text NULL` — `NULL` = home, `boda`/`quince`/`empresarial`/`revelacion` = páginas específicas. Home filtra `.is("event_type", null)`. Videos en loop. Bodas y quince seeded; empresarial y revelación pendientes del cliente.
- **Mapa Google Maps** — embed con `https://maps.google.com/maps?q=4.782638,-74.089686&z=17&output=embed`. Botón "¿Cómo llegar?" abre `https://www.google.com/maps/dir/?api=1&destination=4.782638,-74.089686` en nueva pestaña.
- **Logo SVG** — `public/logo-principal-fondo-claro.svg` sin `<rect>` de fondo. NavBar: `bg-crema/95` con backdrop-blur. Sidebar portal (fondo `#0F0F0F`): `filter: brightness(0) invert(1)` para logo blanco.
- **NavBar "Mi evento"** — client component con `useEffect` + `supabase.auth.onAuthStateChange`. Si hay sesión → `/portal` (redirect por rol en `/portal/page.tsx`). Si no → `/login`.
- **Portal layout** — `PortalShell` (shell con estado de sidebar), `PortalSidebar` (fixed, `w-[248px]`, fondo `#0F0F0F`, hamburger mobile, logo blanco), `PortalHeader` (sticky, título de página, avatar). Main content: `md:ml-[248px]`.
- **Redirect por rol post-login** — `auth.ts` lee `profiles.role` tras `signInWithPassword` y redirige a: `client → /portal/dashboard`, `admin → /admin/dashboard`, `wedding_planner → /portal/planner`, `asesor_comercial → /portal/asesor-comercial`, `asesor_logistica → /portal/asesor-logistica`, `staff → /portal/staff`.
- **payments.receipt_url** — columna `text NULL` en migración `20260624000008`. El cliente sube el PDF al bucket `documents/{booking_id}/` y la Server Action actualiza solo ese campo. El admin confirma el pago manualmente. No hay pasarela de pagos.
- **Flujo de pagos**: 100% manual. Admin registra monto/método/referencia. Cliente sube comprobante PDF desde el portal. Admin confirma. `payment_method_type` enum: `transferencia`, `efectivo`, `cheque`, `otro`.

### Pendiente — próximos pasos

1. **Secciones del portal de clientes** — construir las páginas ya enrutadas:
   - `/portal/evento` — orden de servicio con secciones e ítems (tabla `service_order_sections`, `service_order_items`)
   - `/portal/documentos` — lista de documentos del cliente (tabla `documents`, bucket `documents`)
   - `/portal/pagos` — estado de cuenta + subir comprobante PDF (`payments.receipt_url`, bucket `documents`)
   - `/portal/mensajes` — mensajería interna cliente ↔ staff (tabla `messages`)
   - Extras: `/portal/playlist` (tabla `playlists`), distribución de invitados por mesa (`guest_tables`)

2. **Panel de administración** (`/admin`) — gestión de reservas, mensajes de contacto, clientes, paquetes, galería, `tour_360_url`, pagos.

3. **Videos empresarial y revelación** — los archivos de video los provee el cliente. Cuando estén listos, subir al bucket `videos` y hacer seed en `hero_videos` con `event_type = 'empresarial'` / `'revelacion'`.

4. **Fotos reales al bucket `gallery`** — insertar en `gallery_images` con `category` = `boda`/`quince`/`empresarial`/`revelacion`. SliderGaleria las toma automáticamente.

5. **Tour virtual 360°** — cuando el cliente contrate Matterport/Kuula/Google Street View, insertar la URL en `site_content` donde `key = 'tour_360_url'`. Aparece en las 4 páginas de evento.

6. **Ajustar contenido de paquetes** — los 12 paquetes actuales son placeholders. Refinar con el cliente.

7. **Conectar dominio hacienda-encanto.com a Vercel** — cuando el sitio esté listo para producción. Cuenta Vercel ya aprobada.

### Archivos clave

```
src/
  app/
    page.tsx                           ← Home público (Server Component, fetch paralelo)
    bodas/page.tsx                     ← EventPageConfig + EventPageTemplate
    quince-anos/page.tsx
    eventos-empresariales/page.tsx
    revelacion-de-genero/page.tsx
    actions/
      auth.ts                          ← login (redirect por rol), logout. register() existe pero /registro redirige a /login
      contact.ts                       ← submitContactForm (Zod + reCAPTCHA + Supabase insert)
    (auth)/
      login/page.tsx                   ← Solo formulario de acceso, sin link a /registro
      registro/page.tsx                ← redirect("/login") — ruta deshabilitada
    portal/
      layout.tsx                       ← PortalLayout: auth check + fetch profile + PortalShell
      page.tsx                         ← Redirect por rol a destino específico
      dashboard/page.tsx               ← Dashboard cliente: saludo, countdown, detalles evento, accesos rápidos
      planner/page.tsx
      asesor-comercial/page.tsx
      asesor-logistica/page.tsx
      staff/page.tsx
  components/
    home/                              ← NavBar, HeroSection, EventosSection, NosotrosSection, etc.
    events/                            ← EventPageTemplate, EventHero, Vista360, EventDescripcion, etc.
    portal/
      PortalShell.tsx                  ← Shell con estado sidebarOpen, overlay mobile
      PortalSidebar.tsx                ← Sidebar fijo 248px, fondo #0F0F0F, logo blanco (filter CSS), nav por rol
      PortalHeader.tsx                 ← Header sticky: hamburger mobile, título de página, bell, avatar
      CountdownTimer.tsx               ← Client component, intervalo 1s, responsive (2rem/sm:3rem/md:3.8rem)
    contact/
      ContactForm.tsx
      HomeContactForm.tsx
    ui/
      SubmitButton.tsx
      SliderGaleria.tsx
  lib/supabase/
    server.ts                          ← createClient() async
    client.ts                          ← createBrowserClient
  proxy.ts                             ← Middleware Next.js 16 (protege /portal y /admin)
  types/
    database.ts                        ← Tipos generados (incluye receipt_url en payments)
    recaptcha.d.ts
public/
  logo-principal-fondo-claro.svg       ← Logo transparente. En sidebar: filter brightness(0) invert(1)
  trebol-original.svg                  ← Favicon
supabase/migrations/
  20260620000000_initial_schema.sql    ← 15 tablas base, RLS, enums
  20260620000001_storage_buckets.sql   ← 4 buckets + políticas
  20260620000002_seed_testimonials.sql
  20260620000003_seed_site_content.sql
  20260620000004_seed_spaces.sql
  20260621000000_seed_packages.sql     ← ADD COLUMN event_type + 12 paquetes
  20260622000000_hero_videos_event_type.sql  ← ADD COLUMN event_type text NULL
  20260624000000_fix_stats_site_content.sql
  20260624000001_seed_hero_video_home.sql
  20260624000002_update_hero_video_home_landscape.sql
  20260624000003_add_enum_roles.sql    ← ADD VALUE wedding_planner, asesor_comercial, asesor_logistica
  20260624000004_playlists_guest_tables_calendar.sql  ← tablas playlists, guest_tables, calendar_events
  20260624000005_service_order_detail.sql   ← service_order_sections, service_order_items
  20260624000006_seed_hero_videos_bodas_quince.sql
  20260624000007_test_user_cliente.sql
  20260624000008_payments_receipt_url.sql   ← ADD COLUMN receipt_url + RLS cliente + Storage policies
```
