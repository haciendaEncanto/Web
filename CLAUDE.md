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
| **Fase 6 — Portal base** | Layout portal (`PortalShell` + `PortalSidebar` + `PortalHeader`). `/portal/page.tsx` con redirect por rol. Dashboard cliente con cuenta regresiva (`CountdownTimer`), detalles del evento y accesos rápidos. Sidebar oscuro con logo blanco (filtro CSS). Responsive: hamburger mobile, countdown adaptable. | ✅ |
| **Fase 7 — Módulo orden de servicio** | Vista cliente `/portal/orden-servicio`: barra de progreso, secciones read-only (planner), sección Música editable por cliente, botón "Aprobar". Vista planner `/portal/planner/orden-servicio/[bookingId]`: formulario completo con campos por tipo (text, date, time, select, boolean), botón "Inicializar" para órdenes vacías. Plantillas definitivas para 4 tipos de evento + secciones universales (`event_type='all'`). Modelo dos actores: `filled_by='planner'` (Cabecera + Bebidas) y `filled_by='client'` (Música). Pre-llenado automático de Cabecera desde el booking al inicializar. | ✅ |
| **Fase 8 — Onboarding de clientes (planner)** | `/portal/planner/nuevo-cliente`: flujo completo en una acción — Auth user → profile → booking → initialize_service_order con rollback. Validación Zod v4, solapamiento de horario (normaliza medianoche), guard de rol, admin client para todo DB. `createAdminClient()` en `src/lib/supabase/admin.ts`. RLS `"bookings: staff insert"` para planner/admin. Fix `is_staff_or_admin()` incluye todos los roles staff. Fix sidebar: `isActive` usa igualdad exacta (`pathname === href`). | ✅ |
| **Fase 9 — Panel de administración y rol Editor** | Roles `editor` y `gerente` en enum (migración 20260625000004). `is_editor()` SQL helper. RLS ampliada para gallery_images, hero_videos, testimonials, packages, site_content y Storage (migración 20260625000005). `/admin`: layout protegido solo admin, dashboard KPIs (eventos activos, este mes, contactos 7 días, sin leer), lista de próximos eventos, gestión completa de usuarios (crear/editar/activar). `/editor`: layout para admin y editor, galería, videos, testimonios, paquetes, textos del sitio. proxy.ts protege `/editor/*`. auth.ts y portal/page.tsx incluyen redirect para `editor` y `gerente`. PortalShell reutilizado en admin y editor. | ✅ |
| **Ajustes post-Fase 9** | Reestructura páginas de evento (Hero→Experiencia→Vista360→SliderGalería→Paquetes→Testimonios→Formulario). Transiciones elegantes con trébol y barra dorada. Login mejorado con identidad de marca reforzada. Cierre automático de sesión por inactividad. Módulo actividades cliente (`/portal/actividades`) y planner (`/portal/planner/clientes/[id]/actividades`): timeline con próximas/pasadas, CRUD inline. Soft delete de clientes (planner). Editar datos de cliente (planner). Vista lista de clientes del planner. Usuarios de prueba: admin@haciendaencanto.com (Admin2026!) y editor@haciendaencanto.com (Editor2026!). | ✅ |
| **Ajustes editor/galería/videos** | Upload galería y videos movido completamente al servidor: `FormData` → Server Action → `createAdminClient()` (service_role) → Storage. Elimina `createBrowserClient` del cliente. `next.config.ts`: `bodySizeLimit: "55mb"`. `GaleriaManager` rediseñado: dos secciones (Publicadas/Archivadas), drag & drop con `@dnd-kit/sortable`, límite 8 fotos por categoría independiente, modo mobile con flechas arriba/abajo, badge `{Categoría} N/8` en vista "Todas", fotos archivadas en escala de grises con confirmación inline al eliminar. Upload va a Archivadas por defecto. | ✅ |
| **Ajustes hero (Home + eventos)** | Rediseño de `HeroSection.tsx` y `EventHero.tsx`: overlay reducido de 55% a gradiente suave (30% arriba / ~5% centro / 45% abajo), video a color real. Label superior centrado (tagline dorado + línea decorativa 120×0.6px). H1 reposicionado con `absolute bottom-[8%]` sobre el video (antes centrado). Subtítulo y botones CTA movidos fuera del video, sobre fondo crema, con línea dorada divisoria. Mobile (`<768px`): el `<video>` no se monta en el DOM (`matchMedia` + estado `showVideo`), se usa imagen estática (`thumbnail_url`/`image`) — ahorra ancho de banda. Botones apilados (`flex-col` full width) en mobile, en fila en desktop. Altura del bloque de video ajustada a `h-[calc(100dvh-72px)] md:h-[calc(100vh-72px)]` para compensar el `pt-[72px]` del NavBar fijo y que el título no quede fuera del viewport real. | ✅ |

### Decisiones de arquitectura

- **Sin API Routes** — todas las mutaciones usan Server Actions (`src/app/actions/`). API Routes solo si se necesitan webhooks externos en el futuro.
- **Rutas protegidas**: `/portal` (todos los roles), `/admin` (solo admin) y `/editor` (admin y editor). Nunca `/dashboard`.
- **Sin precios públicos** — los paquetes en el sitio muestran nombre + qué incluye. El CTA siempre es "Cuéntanos tu evento" o "Conoce más". Los precios se discuten privadamente con cada cliente.
- **Sin auto-registro público** — `/registro` redirige a `/login`. Las cuentas las crea el admin o wedding planner. El formulario de registro fue eliminado de la UI.
- **8 roles** — `profiles.role`: `client`, `staff`, `admin`, `wedding_planner`, `asesor_comercial`, `asesor_logistica`, `editor`, `gerente`. Cada rol tiene un destino de redirect post-login diferente (ver `auth.ts` y `/portal/page.tsx`).
- **middleware** → renombrado a `proxy.ts` / función `proxy` (breaking change Next.js 16).
- **reCAPTCHA v3** en el formulario de contacto público: token en cliente → verificación server-side en la Server Action. Se omite en dev si `RECAPTCHA_SECRET_KEY` no está configurada.
- **Supabase SSR**: `createServerClient` en proxy.ts, `createClient()` (async) en server.ts para Server Components y Actions, `createBrowserClient` para client.ts.
- **Admin client** (`src/lib/supabase/admin.ts`) — `createAdminClient()` usa `SUPABASE_SERVICE_ROLE_KEY`, bypasa RLS completamente. Solo usar en Server Actions después de verificar el rol del llamador con SSR client. `auth.uid()` es NULL con service_role.
- **Upload de archivos — patrón servidor** — NUNCA usar `createBrowserClient` para subir a Storage desde el navegador (RLS falla con SSR). Patrón correcto: cliente construye `FormData` con el `File` → llama Server Action → Server Action usa `createAdminClient()` para subir a Storage → devuelve URL pública. Aplica a galería y videos. `bodySizeLimit: "55mb"` en `next.config.ts` (cubre imágenes de 5 MB y videos de 50 MB).
- **Logos y assets locales** (SVG) se sirven desde `public/` con `<img>` directo — no `next/image` para SVGs.
- **Tailwind v4**: config via `@theme inline {}` en globals.css. Variables de color: `--rojo`, `--dorado`, `--crema`, `--negro`, `--verde-bosque`, `--blush`, etc.
- **EventPageTemplate** (Server Component async) — patrón para páginas de eventos: cada `page.tsx` define un `EventPageConfig` estático y delega fetch + render al template. Fetch paralelo de galería, paquetes y testimonios. Orden de secciones: Hero → Experiencia → Vista360 → SliderGalería → Paquetes → Testimonios → Formulario.
- **packages.event_type** — columna `text` en migración `20260621000000`. 12 paquetes (3 × 4 tipos). Los paquetes del mismo nombre tienen contenido diferente por tipo de evento.
- **Gestión de paquetes**: `pnpm` exclusivamente (pnpm-lock.yaml). Nunca `npm install`.
- **Tipos Supabase**: regenerar con `supabase gen types typescript --project-id oewqyckeqolrpjbjevap > src/types/database.ts` después de cada migración.
- **Hero overlays**: un solo gradiente `from-negro/30 via-negro/5 to-negro/45` (sin capa base plana) — video/imagen a color real, más oscuro arriba y abajo para legibilidad, casi transparente al centro. Text-shadow doble capa en tagline dorado y H1 blanco. Aplica en `HeroSection.tsx` y `EventHero.tsx`.
- **Estructura hero** — bloque de video/imagen (`h-[calc(100dvh-72px)] md:h-[calc(100vh-72px)]`, resta el `pt-[72px]` del NavBar fijo) con label superior centrado + línea dorada, y H1 en `absolute bottom-[8%]`. Subtítulo y botones CTA van fuera del bloque, en `<div className="bg-crema">` aparte, separados por línea dorada. Botones `flex-col` (mobile, full width) / `flex-row` (desktop).
- **Hero mobile sin video** — en `<768px` (`window.matchMedia("(min-width: 768px)")` vía `useEffect`) el `<video>` no se renderiza en absoluto (evita descarga en mobile); se muestra `thumbnail_url` (Home) o `image` (EventHero) como fondo estático. El estado por defecto es `false` (SSR/mobile-first), se activa tras montar si el viewport es ≥768px.
- **SliderGaleria** (`src/components/ui/SliderGaleria.tsx`) — client component, crossfade CSS opacity, 8 imágenes, intervalo 3.5s, dots de navegación. Fallback a 5 placeholders WP. Usado en Home y 4 páginas de evento.
- **Vista360** (`src/components/events/Vista360.tsx`) — solo en páginas de evento, después del Hero. Lee `tour_360_url` de `site_content` (maybeSingle). Botón apunta a `#` hasta que el cliente contrate Matterport/Kuula.
- **hero_videos**: columna `event_type text NULL` — `NULL` = home, `boda`/`quince`/`empresarial`/`revelacion` = páginas específicas. Home filtra `.is("event_type", null)`. Videos en loop. Bodas y quince seeded; empresarial y revelación pendientes del cliente.
- **Mapa Google Maps** — embed con `https://maps.google.com/maps?q=4.782638,-74.089686&z=17&output=embed`. Botón "¿Cómo llegar?" abre `https://www.google.com/maps/dir/?api=1&destination=4.782638,-74.089686` en nueva pestaña.
- **Logo SVG** — `public/logo-principal-fondo-claro.svg` sin `<rect>` de fondo. NavBar: `bg-crema/95` con backdrop-blur. Sidebar portal (fondo `#0F0F0F`): `filter: brightness(0) invert(1)` para logo blanco.
- **NavBar "Mi evento"** — client component con `useEffect` + `supabase.auth.onAuthStateChange`. Si hay sesión → `/portal` (redirect por rol en `/portal/page.tsx`). Si no → `/login`.
- **Portal layout** — `PortalShell` (shell con estado de sidebar), `PortalSidebar` (fixed, `w-[248px]`, fondo `#0F0F0F`, hamburger mobile, logo blanco), `PortalHeader` (sticky, título de página, bell, avatar). Main content: `md:ml-[248px]`.
- **PortalSidebar isActive** — `pathname === href` (igualdad exacta). No usar `startsWith` porque `/portal/planner` es prefijo de subrutas y causa activación múltiple.
- **Redirect por rol post-login** — `auth.ts` lee `profiles.role` tras `signInWithPassword` y redirige a: `client → /portal/dashboard`, `admin → /admin/dashboard`, `wedding_planner → /portal/planner`, `asesor_comercial → /portal/asesor-comercial`, `asesor_logistica → /portal/asesor-logistica`, `staff → /portal/staff`, `editor → /editor/galeria`, `gerente → /portal/gerente`.
- **Roles editor y gerente** — `editor`: gestiona gallery_images, hero_videos, testimonials, packages (sin precios), site_content. NO accede a clientes, pagos, órdenes. `gerente`: solo lectura, estadísticas (portal pendiente). Enum ampliado con migración `20260625000004`; RLS con `is_editor()` en `20260625000005`.
- **Panel /admin** — solo rol `admin`. Layout usa `PortalShell`. Dashboard: KPIs con `createAdminClient()`. `UsuariosManager`: `admin.auth.admin.createUser()` → update profile. Acciones en `src/app/actions/admin/`.
- **Portal /editor** — roles `admin` y `editor`. Layout usa `PortalShell`. Acciones en `src/app/actions/editor/`. File upload: `FormData` → Server Action → `createAdminClient()` → Storage (sin cliente Supabase en el navegador).
- **GaleriaManager — dos secciones** — "Publicadas" (`is_published: true`, grid con drag & drop `@dnd-kit/sortable`, badge verde) y "Archivadas" (`is_published: false`, escala de grises, hover: Publicar + Eliminar). Límite de 8 fotos por categoría independiente (`publishedCountByCategory`). Upload siempre va a Archivadas. Reordenar guarda `sort_order` en BD solo para los ítems visibles (respeta categoría del slider). Modo mobile: botón "Reordenar" activa lista vertical con flechas.
- **site_content schema** — columnas: `key` (unique), `title` (text null), `content` (text null), `data` (jsonb). La key `hero` usa title+content; `stats` y `contact` usan data JSON; `tour_360_url` usa content. `ContenidoManager` edita title/content como texto y data como JSON textarea.
- **updateSiteContentText(key, field, value)** — recibe `field: "title" | "content"`, construye el update con `field === "title" ? { title } : { content }` para evitar error TypeScript con computed property names contra tipos Supabase.
- **payments.receipt_url** — columna `text NULL` en migración `20260624000008`. El cliente sube el PDF al bucket `documents/{booking_id}/` y la Server Action actualiza solo ese campo. El admin confirma el pago manualmente. No hay pasarela de pagos.
- **Flujo de pagos**: 100% manual. Admin registra monto/método/referencia. Cliente sube comprobante PDF desde el portal. Admin confirma. `payment_method_type` enum: `transferencia`, `efectivo`, `cheque`, `otro`.
- **Modelo dos actores en orden de servicio** — `filled_by` en `service_order_templates` y `service_order_items`: `'planner'` (Cabecera + Bebidas), `'client'` (Música y playlist). Los templates con `event_type='all'` aplican a todos los eventos; los de tipo específico (`'boda'`, etc.) se suman. La vista cliente solo puede editar ítems con `filled_by='client'`.
- **initialize_service_order(p_booking_id)** — PL/pgSQL `security definer`. Idempotente (borra y recrea). Acepta service_role (`auth.uid() IS NULL`); si hay sesión, verifica `is_planner_or_admin()`. Tras crear ítems en blanco, pre-llena 6 campos de Cabecera con valores del booking: `event_date`, `event_start_time` (HH24:MI), `event_end_time`, `profiles.full_name`, `event_type` (etiqueta legible), `guest_count`.
- **bookings: staff insert** — política RLS `WITH CHECK (is_staff_or_admin())`. Permite al planner crear bookings para otros clientes (sin esta política, la única INSERT existente exige `client_id = auth.uid()`).
- **is_staff_or_admin()** — incluye `admin`, `staff`, `wedding_planner`, `asesor_comercial`, `asesor_logistica`. Migración 13 la corrigió (antes excluía los roles nuevos).
- **Validación de solapamiento de horario** — en `crear-cliente.ts`, antes del INSERT: consulta bookings no cancelados del mismo `event_date`, aplica `overlaps(s1,e1,s2,e2)` = `start1 < end2 AND start2 < end1`. Extremos que cruzan medianoche se normalizan con `+1440`. Error en `field: 'event_start_time'`.
- **createClientAction** (onboarding planner) — patrón: 1) verificar rol con SSR client, 2) Zod validate, 3) overlap check con admin client, 4) createUser → update profile → get space → insert booking → rpc initialize_service_order, todo con admin client. Rollback: borra booking y usuario en orden inverso si lanza.
- **Módulo actividades** — `calendar_events` tabla. Vista cliente `/portal/actividades`: timeline, próximas con borde dorado, pasadas tachadas. Vista planner `/portal/planner/clientes/[clientId]/actividades`: CRUD inline (`ActividadesPlanner.tsx`). Server Actions en `src/app/actions/actividades.ts`.
- **Soft delete / editar cliente (planner)** — El planner puede marcar clientes como inactivos (soft delete) y editar datos básicos. Vista `/portal/planner/clientes` lista todos los clientes con acceso a sus acciones.

### Pendiente — próximas sesiones

1. **Módulo de documentos** (`/portal/documentos`) — lista de documentos del cliente (tabla `documents`, bucket `documents/{booking_id}/`). Upload de contrato PDF, descarga. Vista planner para subir documentos al cliente.

2. **Módulo de pagos** (`/portal/pagos`) — estado de cuenta del cliente: monto total, pagos realizados, saldo pendiente. Subir comprobante PDF (`payments.receipt_url`, bucket `documents`). Vista planner/admin para registrar pagos y confirmar comprobantes.

3. **Mensajería interna** (`/portal/mensajes`) — hilo de mensajes cliente ↔ planner/staff (tabla `messages`). Notificación visual en el PortalHeader (bell icon ya presente).

4. **Playlist cliente** (`/portal/playlist`) — tabla `playlists`, cliente agrega canciones con artista y género.

5. **Distribución de invitados por mesa** (`/portal/invitados`) — tabla `guest_tables`, cliente organiza invitados en mesas con nombre y capacidad.

6. **Vista 360° real** — cuando el cliente contrate Matterport / Kuula / Google Street View, insertar URL en `site_content` donde `key = 'tour_360_url'`. El componente `Vista360.tsx` ya consume esa key.

7. **Conectar dominio hacienda-encanto.com a Vercel** — cuando el sitio esté listo para producción. Cuenta Vercel ya aprobada.

8. **Videos empresarial y revelación** — archivos los provee el cliente. Subirlos desde `/editor/videos` (upload ya funcional), activar para la página correspondiente.

9. **Fotos reales en todas las categorías** — subirlas desde `/editor/galeria` (upload ya funcional), publicarlas en su categoría. SliderGaleria y páginas de evento las toman automáticamente.

10. **Panel Gerente** (`/portal/gerente`) — solo lectura. Dashboard de estadísticas: eventos por mes, ingresos, ocupación del salón. Vista de todos los pagos y estado financiero global. Calendario de eventos. El enum ya tiene `gerente` (migración 20260625000004); solo falta construir el portal.

11. **Ampliar panel /admin** — gestión de reservas (lista, filtros, cancelar), mensajes de contacto (marcar leído), vista de pagos globales.

12. **Ajustar contenido de paquetes** — los 12 paquetes actuales son placeholders. Refinar con el cliente.

### Archivos clave

```
src/
  app/
    page.tsx                                      ← Home público (Server Component, fetch paralelo)
    bodas/page.tsx                                ← EventPageConfig + EventPageTemplate
    quince-anos/page.tsx
    eventos-empresariales/page.tsx
    revelacion-de-genero/page.tsx
    actions/
      auth.ts                                     ← login (redirect por rol), logout, cierre por inactividad
      contact.ts                                  ← submitContactForm (Zod + reCAPTCHA + Supabase insert)
      crear-cliente.ts                            ← createClientAction: onboarding planner, admin client, overlap check, rollback
      orden-servicio.ts                           ← saveMusicItems, approveServiceOrder, savePlannerItems, initServiceOrder
      actividades.ts                              ← createActivity, updateActivity, deleteActivity
      admin/
        usuarios.ts                               ← crearUsuario, editarUsuario, toggleUsuarioActivo
      editor/
        galeria.ts                                ← uploadGaleriaImage (FormData→admin→Storage), updateGaleriaImage, deleteGaleriaImage, reorderGaleriaImages
        videos.ts                                 ← uploadVideo (FormData→admin→Storage), activateVideo, deactivateVideo, deleteVideo
        testimonios.ts                            ← createTestimonio, updateTestimonio, deleteTestimonio
        paquetes.ts                               ← createPaquete, updatePaquete, deletePaquete
        contenido.ts                              ← updateSiteContentText(key, field, value), updateSiteContentData(key, json)
    (auth)/
      login/page.tsx                              ← Formulario de acceso con identidad de marca
      registro/page.tsx                           ← redirect("/login") — ruta deshabilitada
    portal/
      layout.tsx                                  ← PortalLayout: auth check + fetch profile + PortalShell
      page.tsx                                    ← Redirect por rol a destino específico
      dashboard/page.tsx                          ← Dashboard cliente: saludo, countdown, detalles evento, accesos rápidos
      orden-servicio/page.tsx                     ← Vista cliente: secciones + barra de progreso
      actividades/page.tsx                        ← Timeline del cliente (próximas con borde dorado, pasadas tachadas)
      planner/page.tsx                            ← Panel planner: lista de bookings con enlace a orden
      planner/nuevo-cliente/page.tsx              ← Formulario onboarding cliente (guard: solo planner/admin)
      planner/orden-servicio/[bookingId]/page.tsx ← Orden editable para planner
      planner/clientes/page.tsx                   ← Lista de clientes del planner (soft delete, editar)
      planner/clientes/[clientId]/actividades/page.tsx ← Vista planner: CRUD actividades del cliente
      asesor-comercial/page.tsx
      asesor-logistica/page.tsx
      staff/page.tsx
    admin/
      layout.tsx                                  ← Solo admin, usa PortalShell
      dashboard/page.tsx                          ← KPIs + próximos eventos + contactos recientes
      usuarios/page.tsx                           ← Tabla de usuarios + crear/editar modales
    editor/
      layout.tsx                                  ← Admin y editor, usa PortalShell
      page.tsx                                    ← redirect("/editor/galeria")
      galeria/page.tsx
      videos/page.tsx
      testimonios/page.tsx
      paquetes/page.tsx
      contenido/page.tsx
  components/
    home/                                         ← NavBar, HeroSection, EventosSection, NosotrosSection, etc.
    events/                                       ← EventPageTemplate, EventHero, Vista360, EventDescripcion, etc.
    portal/
      PortalShell.tsx                             ← Shell con estado sidebarOpen, overlay mobile (reutilizado en admin y editor)
      PortalSidebar.tsx                           ← Sidebar fijo 248px, fondo #0F0F0F, logo blanco, isActive exacto, nav por rol
      PortalHeader.tsx                            ← Header sticky: hamburger, título de página, bell (unreadCount), avatar
      CountdownTimer.tsx                          ← Client component, intervalo 1s, responsive
      NuevoClienteForm.tsx                        ← useActionState, show/hide password, errores por campo
      orden-servicio/
        OrdenServicioView.tsx                     ← Vista cliente: barra progreso, secciones, música editable, aprobar
        PlannerOrdenForm.tsx                      ← Vista planner: todos los ítems editables, InitButton, campo condicional adicionales
      planner/
        ActividadesPlanner.tsx                    ← CRUD inline actividades: form agregar, editar, confirmar borrar
    admin/
      UsuariosManager.tsx                         ← Tabla + CrearModal + EditarModal + toggleUsuarioActivo
    editor/
      GaleriaManager.tsx                          ← Dos secciones (Publicadas/Archivadas), @dnd-kit/sortable, límite 8/categoría, upload server-side
      VideosManager.tsx                           ← Lista agrupada por página, upload server-side (FormData), toggle activo, 1 activo por página
      TestimoniosManager.tsx                      ← CRUD inline, StarRating component
      PaquetesManager.tsx                         ← CRUD inline, filtro por tipo, lista incluidos
      ContenidoManager.tsx                        ← Acordeón por key, TextField + JsonField con guardado por campo
    contact/
      ContactForm.tsx
      HomeContactForm.tsx
    ui/
      SubmitButton.tsx
      SliderGaleria.tsx
  lib/supabase/
    server.ts                                     ← createClient() async (SSR, con sesión)
    client.ts                                     ← createBrowserClient
    admin.ts                                      ← createAdminClient() (service_role, bypasa RLS)
  proxy.ts                                        ← Middleware Next.js 16 (protege /portal, /admin, /editor)
  types/
    database.ts                                   ← Tipos generados Supabase
    recaptcha.d.ts
public/
  logo-principal-fondo-claro.svg                  ← Logo transparente. En sidebar: filter brightness(0) invert(1)
  trebol-original.svg                             ← Favicon
supabase/migrations/
  20260620000000_initial_schema.sql               ← 15 tablas base, RLS, enums
  20260620000001_storage_buckets.sql              ← 4 buckets + políticas
  20260620000002_seed_testimonials.sql
  20260620000003_seed_site_content.sql
  20260620000004_seed_spaces.sql
  20260621000000_seed_packages.sql                ← ADD COLUMN event_type + 12 paquetes
  20260622000000_hero_videos_event_type.sql       ← ADD COLUMN event_type text NULL
  20260624000000_fix_stats_site_content.sql
  20260624000001_seed_hero_video_home.sql
  20260624000002_update_hero_video_home_landscape.sql
  20260624000003_add_enum_roles.sql               ← ADD VALUE wedding_planner, asesor_comercial, asesor_logistica
  20260624000004_playlists_guest_tables_calendar.sql
  20260624000005_service_order_detail.sql         ← service_order_sections, service_order_items, service_order_templates
  20260624000006_seed_hero_videos_bodas_quince.sql
  20260624000007_test_user_cliente.sql
  20260624000008_payments_receipt_url.sql         ← ADD COLUMN receipt_url + RLS cliente + Storage policies
  20260624000009_seed_test_booking.sql
  20260624000010_seed_test_planner.sql
  20260624000011_seed_service_order_templates_quince_empresarial_revelacion.sql
  20260624000012_restructure_service_order_templates.sql ← filled_by, secciones universales, modelo dos actores
  20260624000013_fix_is_staff_or_admin.sql        ← incluye wedding_planner + asesores en la función
  20260624000014_profiles_add_address.sql         ← ADD COLUMN address text NULL
  20260624000015_bookings_staff_insert_policy.sql ← "bookings: staff insert" + initialize_service_order acepta service_role
  20260624000016_initialize_service_order_prefill.sql ← pre-llena 6 ítems de Cabecera desde el booking
  20260625000004_editor_role.sql                  ← ADD VALUE editor, gerente al enum user_role
  20260625000005_editor_rls.sql                   ← is_editor(), RLS gallery/videos/testimonials/packages/site_content + Storage
  20260625000006_seed_admin_user.sql              ← admin@haciendaencanto.com / Admin2026! / role=admin
  20260625000007_seed_editor_user.sql             ← editor@haciendaencanto.com / Editor2026! / role=editor
```
