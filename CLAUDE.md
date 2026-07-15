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
| **Ajustes hero (Home + eventos)** | Rediseño de `HeroSection.tsx` y `EventHero.tsx`: overlay reducido de 55% a gradiente suave (30% arriba / ~5% centro / 45% abajo), video a color real. Label superior centrado (tagline dorado + línea decorativa 120×0.6px). H1 reposicionado con `absolute bottom-[8%]` sobre el video (antes centrado). Subtítulo y botones CTA movidos fuera del video, sobre fondo crema, con línea dorada divisoria. El `<video>` se reproduce en todos los tamaños de pantalla (`autoPlay muted loop playsInline`, sin gating por mobile) — `playsInline` es clave para reproducción inline en iOS Safari. Botones apilados (`flex-col` full width) en mobile, en fila en desktop. Altura del bloque de video ajustada a `h-[calc(100dvh-72px)] md:h-[calc(100vh-72px)]` para compensar el `pt-[72px]` del NavBar fijo y que el título no quede fuera del viewport real. | ✅ |
| **Migración uploads a signed URL** | Fix del error "An unexpected response was received from the server" al subir videos en producción (Vercel Hobby limita a 4.5MB el body de toda Server Action, sin importar `bodySizeLimit`). Videos y galería del editor migrados a upload directo a Supabase Storage vía signed URL — el archivo nunca pasa por Vercel. Nueva infraestructura reutilizable en `src/lib/uploads/`. Se retiró `bodySizeLimit: "55mb"` de `next.config.ts` (ya no hace falta). Documentos/pagos/Excel de invitados: kinds de configuración listos, módulos aún no construidos. | ✅ |
| **Admin usuarios/clientes + segmentación + galería** | `/admin/usuarios` solo "Equipo" (roles staff, CRUD) — `client` nunca aparece ahí. Segmentación Activos/Cumplidos/Cancelados (tabs), componente compartido `ClientesTable.tsx`, reusado en `/portal/planner/clientes` y (más tarde) `/admin/clientes`. Función SQL `sync_completed_bookings()` (+ cron diario vía pg_cron) marca `bookings.status = 'completed'` cuando `event_date` ya pasó; se invoca de forma oportunista desde `fetchClientBookingRows()`/`fetchAllBookingsWithClient()` cada vez que se listan clientes/eventos. `GaleriaManager`: el modal de upload preselecciona la categoría del filtro activo en vez de "General". | ✅ |
| **CRUD clientes admin + panel Eventos** | `/admin/clientes`: CRUD completo reusando componentes del planner (`NuevoClienteForm`, `ClienteEditForm`, `PlannerOrdenForm`) — `ClientesTable` con prop `basePath="admin"` colapsa "ver orden"+"editar" en un botón "Ver cliente" → `/admin/clientes/[clientId]` (vista única: datos del cliente editables + orden de servicio completa, no dos rutas separadas como en el planner). `ClienteEditForm` gana prop `redirectTo` (default `/portal/planner/clientes`) para reusarse desde admin. Fix de bug real: `Section`/`Field` estaban definidos *dentro* de `ClienteEditForm` (se recreaban en cada render → React desmontaba los inputs en cada tecla, perdiendo el foco/valor) — se movieron a nivel de módulo. `/admin/usuarios`: el modal "Nuevo usuario" pierde el campo Teléfono (solo nombre/email/contraseña/rol) y el select de rol exige selección explícita (sin default "client"). `KpiCard.tsx` extraído de `admin/dashboard/page.tsx` para reusar en varias vistas admin. (Nota: el `/admin/eventos` construido en este punto fue fusionado de vuelta en `/admin/dashboard` en el ajuste siguiente — ver fila de abajo). | ✅ |
| **Dashboard admin unificado + Imágenes del sitio + slider aleatorio + fixes** | **Fusión dashboard+eventos**: `/admin/dashboard` ahora es la única página — KPIs (Eventos activos, Este mes, Realizados, Cancelados) + próximos eventos + contactos recientes + tabla de eventos completa con tabs de estado y rango de fechas, todo sin navegar a otra ruta. `/admin/eventos` eliminada; `EventosManager.tsx` quedó solo con la tabla+filtros (sin sus propios `KpiCard`, ahora calculados una vez en la página); sidebar admin sin el ítem "Eventos". **Imágenes del sitio**: nueva sección `/editor/imagenes-sitio` (admin y editor) para cambiar las 8 imágenes editables del Home — 4 cards de eventos, 1 Nosotros, 3 de servicios — guardadas en `site_content` (`img_card_boda/quince/empresarial/revelacion`, `img_nosotros`, `img_servicio_catering/fotografia/decoracion`), con upload directo a Storage vía signed URL (bucket `gallery`, carpeta `sitio/`) igual que galería/videos. `EventosSection`, `NosotrosSection` y `ServiciosSection` del Home ahora reciben esas imágenes como prop, con fallback a `/placeholder-evento.svg` si la clave está vacía. **Slider aleatorio**: el slider "Momentos reales" del Home (`src/lib/random-slider.ts`) reparte 8 cupos lo más parejo posible entre las categorías de galería que tengan fotos y elige al azar dentro de cada una — aleatorio por cada request del servidor (`Math.random()`), no por sesión de navegador. Las páginas de evento individuales (`/bodas`, etc.) siguen mostrando solo su categoría, sin aleatoriedad. **Fix slider pixelado**: `SliderGaleria.tsx` migrado de `<img>` plano a `next/image` con `fill` + `sizes="100vw"` + `object-cover` (antes ya usaba `object-cover` pero servía el archivo crudo sin optimizar). **Fix logout por inactividad**: la Server Action `logout()` (que hace `redirect("/")`) se invocaba fuera de un `form action` (desde un timeout), por lo que la redirección no siempre se completaba — se agregó `window.location.href = "/"` como fallback en un `finally` en `PortalShell.triggerLogout` y `PortalSidebar.handleLogout`. **Login**: link discreto "← Regresar al inicio" (dorado, `text-xs`, centrado) debajo del formulario. | ✅ |
| **QA end-to-end + fixes** | Auditoría no destructiva de sitio público, portal cliente/planner, admin y editor (proxy.ts, formularios, CRUD, protección de rutas) sin hallazgos críticos de negocio. Fixes aplicados: (1) las ~50 URLs de fallback de imagen que apuntaban al WordPress viejo (`hacienda-encanto.com/wp-content/...`, dominio ya no sirve esos archivos) en 13 archivos se reemplazaron por `public/placeholder-evento.svg` (placeholder de marca local, sin dependencia externa) — visible hoy en `/eventos-empresariales` y `/revelacion-de-genero`, que aún no tienen fotos reales; (2) el usuario de prueba `cliente@test.com` (migración `20260624000007`) se había perdido de `auth.users` a pesar de figurar como aplicada — se recreó junto con su booking y orden de servicio en la migración `20260625000011_reseed_test_cliente.sql` (idempotente); (3) migración `20260625000010` (seed imágenes del sitio) que solo existía en local se aplicó al remoto vía `supabase db push`. | ✅ |
| **Fallbacks de marca + fotos de perfil/testimonios + transición de navegación** | El placeholder verde `/placeholder-evento.svg` dejó de usarse para hero/cards sin imagen y para fotos de personas. `HeroLogoFallback.tsx` (variantes `dark`/`light`) muestra el logo de la hacienda en vez del verde en `HeroSection`, `EventHero`, `EventosSection` y `ServiciosSection`; el poster del `<video>` usa un data URL negro. Nuevo `public/placeholder-avatar.svg` para testimonios/usuarios/perfil de cliente. Migración `testimonials.photo_url` + upload de foto en `/editor/testimonios`; `avatar_url` de `profiles` (ya existía en el esquema, sin usar) ahora se sube desde `/admin/usuarios` (equipo) y `/portal/perfil` (cliente, nuevo) y se muestra en `PortalHeader`. **Transición de navegación**: `PageTransitionProvider` (Context, vive una sola vez en `layout.tsx`, sobrevive a las navegaciones) + `PageTransitionLink` (navbar y cards de eventos del Home) — el click enciende el overlay y navega de inmediato (`router.push` sin `setTimeout` bloqueante), y un efecto sobre `usePathname()` en el provider apaga el overlay cuando la nueva página ya montó. `TransitionOverlay.tsx` (el mismo del logout) se porta a `document.body` vía `createPortal` — si se renderiza dentro de un ancestro con `backdrop-filter`/`filter`/`transform` (p. ej. el `<nav>` con `backdrop-blur-md`), un `position: fixed` queda contenido en ESE ancestro en vez del viewport, y sin el portal el overlay se veía como una franja diminuta en la barra del NavBar en vez de cubrir la pantalla. `pointer-events-none` siempre activo (antes solo cuando estaba oculto, bloqueaba clics mientras se mostraba). `IntroOverlay.tsx` reusa el mismo `TransitionOverlay` como splash de 600ms en la carga inicial (montado una vez en `layout.tsx`, no reaparece en navegaciones internas porque el layout raíz no se remonta). | ✅ |
| **Módulo documentos y pagos** | `/portal/documentos` y `/portal/pagos` (cliente) + `/portal/planner/clientes/[clientId]/{documentos,pagos}` (planner) + `/admin/clientes/[clientId]/pagos` (admin, misma vista que planner). Migraciones: `payments.status` (nuevo enum `payment_status` pending/confirmed — antes no existía ningún estado), `payments.concept`, `payment_method_type` +`tarjeta`. Documentos: planner sube PDF (signed URL a `documents/{booking_id}/contratos/`), cliente descarga con signed URL de 1h; tamaño del archivo se lee de Storage (`list()`) en vez de guardarse en la tabla. Pagos: card resumen (total/abonado *confirmado*/saldo + barra dorada) compartido entre las 3 vistas; cliente sube comprobante solo en pagos pendientes sin comprobante (`documents/{booking_id}/comprobantes/`); planner/admin confirma un pago únicamente si ya tiene comprobante subido (`confirmarPago` → `payments.status='confirmed'`). Notificaciones en cada paso (nuevo documento, comprobante subido, pago confirmado). `src/lib/uploads/` gana kinds `document`/`payment-receipt` y `createSignedDownload`/`getStoredFileSize` (necesarios porque `documents` es bucket privado, a diferencia de `gallery`/`avatars`, que son públicos). | ✅ |
| **Mensajería simplificada (WhatsApp directo)** | `/portal/mensajes` (cliente): página estática con mensaje "Comunícate directamente con el equipo de tu evento" y botón que abre `https://wa.me/573247836852` con texto prellenado (`Hola, soy {nombre}, tengo una consulta sobre mi evento del {fecha}` — nombre y fecha se leen de `profiles`/`bookings` en el momento; si no hay booking activo se omite la fecha). `WhatsAppIcon.tsx` (`src/components/ui/`) — mismo path SVG que el botón flotante del sitio público, con prop `color` (verde `#25D366` por defecto, blanco cuando va sobre fondo verde sólido) para poder reusarlo tanto en el ícono del sidebar como en el botón de la página. Sidebar del cliente: ícono de "Mensajes" cambiado de `MessageSquare` a `WhatsAppIcon` (siempre verde, no seguía la convención dorado/gris de los demás ítems activo/inactivo). Es una simplificación deliberada — la mensajería avanzada (hilo interno o grupo de WhatsApp por evento vía CallMeBot) sigue pendiente de evaluación con el cliente, ver "Pendiente". | ✅ |
| **Módulo playlist** | `/portal/playlist` (cliente): toggle centinela "Llevaré acompañamiento musical propio" (oculta todos los campos y guarda una fila especial `section='centinela'` con `no_aplica=true/false` — no hay columna aparte para esto). Si está desactivado, muestra los campos URL según `event_type` del booking activo, definidos en `src/lib/playlist-templates.ts` (`PLAYLIST_TEMPLATES`: boda 12 campos, quince 8, empresarial/revelación 1 cada uno) + textarea de Observaciones (`section='observaciones'`, el texto se guarda en `song_url`, no hay columna de notas separada). `savePlaylist(bookingId, items)` (`src/app/actions/playlist.ts`) hace upsert en `playlists` (`onConflict: booking_id,section`) y notifica a todos los `admin`/`wedding_planner`. Vista planner (`/portal/planner/clientes/[clientId]/playlist`) y admin (`/admin/clientes/[clientId]/playlist`) reusan el mismo `PlaylistReadOnly.tsx` (Server Component, solo lectura, botón "Abrir" por URL, mensaje especial si el cliente lleva música propia). `/portal/staff` reescrito: `StaffEventsView.tsx` (Client Component) lista bookings con status pending/confirmed y al seleccionar uno muestra su playlist con el mismo `PlaylistReadOnly`. Migración `20260718000000_playlist_module.sql`: agrega 6 valores al enum `playlist_section` (`vals_opcion_2`, `vals_opcion_3`, `acompanamiento_salon`, `playlist_ceremonia`, `observaciones`, `centinela`) y reescribe la política RLS `"playlists: select"` — antes `staff` veía TODAS las playlists sin restricción; ahora solo las de bookings con `status in (pending, confirmed)` (admin/wedding_planner siguen viendo todo, `asesor_comercial`/`asesor_logistica` sin acceso, sin cambios ahí). `ClientesTable.tsx` gana ícono "Playlist" (`Music2`) en la fila de planner y de admin. Sidebar cliente: "Mi Música" con ícono `Music2`. Probado en vivo con un usuario `staff` temporal (creado y borrado solo para el test). | ✅ |

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
- **Upload de archivos — patrón signed URL (cliente sube directo a Supabase)** — NUNCA pasar el archivo completo por una Server Action (Vercel limita el body a 4.5MB independientemente de `bodySizeLimit`, por eso `uploadVideo`/`uploadGaleriaImage` con `FormData` fallaban en producción con videos grandes). Patrón correcto, en 3 pasos: 1) el cliente llama una Server Action de "request" (`requestVideoUpload`/`requestGaleriaUpload`/`requestSiteImageUpload`) que valida tipo/tamaño declarados y genera una signed upload URL con `createAdminClient().storage.from(bucket).createSignedUploadUrl(path)` (expira en 5 min); 2) el cliente sube el archivo DIRECTO a Supabase Storage con `uploadFileToSignedUrl()` (`src/lib/uploads/client.ts`, usa el browser client + el token firmado — el archivo nunca toca Vercel); 3) el cliente llama una Server Action de "confirm" (`confirmVideoUpload`/`confirmGaleriaUpload`/`confirmSiteImageUpload`) que inserta/actualiza el registro en BD (`hero_videos`/`gallery_images`/`site_content`) usando `publicUrlFor()`, y si falla borra el archivo subido con `removeUploadedFile()`. Infraestructura compartida en `src/lib/uploads/`: `config.ts` (kinds — `hero-video`, `gallery-image`, `site-image` —, límites, mime types, path builders, `SITE_IMAGE_KEYS`/`SiteImageKey` — sin secretos, importable desde cliente y desde Server Components), `server.ts` (`createSignedUpload`, `publicUrlFor`, `removeUploadedFile` — usa `createAdminClient()`), `client.ts` (`uploadFileToSignedUrl` — usa el browser client). Aplica hoy a galería, videos e imágenes del sitio (`img_card_*`, `img_nosotros`, `img_servicio_*` en `site_content`, bucket `gallery/sitio/`); documentos/pagos/Excel de invitados tienen sus kinds definidos en `config.ts` pero sus módulos aún no están construidos (ver "Pendiente"). Los buckets de Supabase (`gallery`, `videos`, `documents`) ya tienen `file_size_limit`/`allowed_mime_types` propios como defensa adicional del lado del servidor. Ya no se necesita `bodySizeLimit` en `next.config.ts` — se retiró. **Importante**: las constantes compartidas entre un archivo `"use server"` y componentes/páginas (como `SITE_IMAGE_KEYS`) deben vivir en un módulo aparte (`lib/uploads/config.ts`), nunca exportarse junto a las funciones de un archivo `"use server"` — Next.js solo permite exportar funciones async desde esos archivos.
- **Logos y assets locales** (SVG) se sirven desde `public/` con `<img>` directo — no `next/image` para SVGs.
- **Tailwind v4**: config via `@theme inline {}` en globals.css. Variables de color: `--rojo`, `--dorado`, `--crema`, `--negro`, `--verde-bosque`, `--blush`, etc.
- **EventPageTemplate** (Server Component async) — patrón para páginas de eventos: cada `page.tsx` define un `EventPageConfig` estático y delega fetch + render al template. Fetch paralelo de galería, paquetes y testimonios. Orden de secciones: Hero → Experiencia → Vista360 → SliderGalería → Paquetes → Testimonios → Formulario.
- **packages.event_type** — columna `text` en migración `20260621000000`. 12 paquetes (3 × 4 tipos). Los paquetes del mismo nombre tienen contenido diferente por tipo de evento.
- **Gestión de paquetes**: `pnpm` exclusivamente (pnpm-lock.yaml). Nunca `npm install`.
- **Tipos Supabase**: regenerar con `supabase gen types typescript --project-id oewqyckeqolrpjbjevap > src/types/database.ts` después de cada migración.
- **Hero overlays**: un solo gradiente `from-negro/30 via-negro/5 to-negro/45` (sin capa base plana) — video/imagen a color real, más oscuro arriba y abajo para legibilidad, casi transparente al centro. Text-shadow doble capa en tagline dorado y H1 blanco. Aplica en `HeroSection.tsx` y `EventHero.tsx`.
- **Estructura hero** — bloque de video/imagen (`h-[calc(100dvh-72px)] md:h-[calc(100vh-72px)]`, resta el `pt-[72px]` del NavBar fijo) con label superior centrado + línea dorada, y H1 en `absolute bottom-[8%]`. Subtítulo y botones CTA van fuera del bloque, en `<div className="bg-crema">` aparte, separados por línea dorada. Botones `flex-col` (mobile, full width) / `flex-row` (desktop).
- **SliderGaleria** (`src/components/ui/SliderGaleria.tsx`) — client component, crossfade CSS opacity, 8 imágenes, intervalo 3.5s, dots de navegación. Fallback a `/placeholder-evento.svg` (marca, local). Usado en Home y 4 páginas de evento.
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
- **Portal /editor** — roles `admin` y `editor`. Layout usa `PortalShell`. Acciones en `src/app/actions/editor/`. File upload (galería, videos, imágenes del sitio): patrón signed URL — ver bullet "Upload de archivos" arriba — el archivo va directo del navegador a Supabase Storage, nunca por una Server Action.
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
- **Segmentación de clientes (Activos/Cumplidos/Cancelados)** — `getClientSegment(status, isActive)` en `src/lib/clientes.ts`: `cancelados` si `status === "cancelled"` o `!isActive` (máxima precedencia), si no `cumplidos` si `status === "completed"`, si no `activos`. `ClientesTable.tsx` (`src/components/clientes/`) es el componente compartido con tabs (default "Activos"), prop `readOnly` (oculta acciones) y prop `basePath: "planner" | "admin"` (cambia a dónde apuntan las acciones — ver bullet siguiente). Usado en `/portal/planner/clientes` y `/admin/clientes`.
- **sync_completed_bookings()** — función SQL `security definer` (migración `20260625000008`) que marca `status = 'completed'` en bookings con `event_date < current_date` y status `pending`/`confirmed`. Programada diariamente vía `pg_cron` (migración `20260625000009`, en archivo separado a propósito: si la extensión no está disponible, esa migración falla sola sin tumbar la función). `fetchClientBookingRows()`/`fetchAllBookingsWithClient()` la invocan vía RPC de forma oportunista antes de cada query, así la segmentación queda correcta aunque el cron no haya corrido aún.
- **Admin: Usuarios vs Clientes vs Dashboard(Eventos), rutas separadas** — `/admin/usuarios` (`UsuariosManager`, solo Equipo — `"client"` nunca aparece en `ROLE_OPTIONS`/`ROLE_LABEL` ni en los `z.enum([...])` de `src/app/actions/admin/usuarios.ts`, ni el modal "Nuevo usuario" pide teléfono). `/admin/clientes` (CRUD completo: lista con `ClientesTable basePath="admin"`, `/admin/clientes/nuevo` reusa `NuevoClienteForm` sin modificar, `/admin/clientes/[clientId]` combina `ClienteEditForm` + `PlannerOrdenForm` en una sola vista — a diferencia del planner, que usa 2 rutas separadas para editar y ver la orden). `/admin/dashboard` (KPIs + próximos eventos + contactos recientes + `EventosManager` con tabs Todos/En proceso/Realizados/Cancelados + rango de fechas — todos los bookings del salón, ya no vive en una ruta `/admin/eventos` separada). Las tres son admin-only (no `wedding_planner`).
- **`/admin/dashboard` unificado (KPIs + eventos)** — antes existían `/admin/dashboard` (KPIs + próximos eventos + contactos) y `/admin/eventos` (tabla filtrable) por separado; se fusionaron en una sola página. `EventosManager.tsx` ya no calcula ni muestra sus propios `KpiCard` — recibe `rows: BookingEventRow[]` y solo resuelve tabs de estado + rango de fechas + tabla; los 4 KPIs (Eventos activos, Este mes, Realizados, Cancelados) se calculan una vez en `admin/dashboard/page.tsx` sobre el mismo `rows` que alimenta la tabla, usando `fetchAllBookingsWithClient()` (`src/lib/eventos.ts`). Si se necesita volver a exponer una vista de solo-eventos en el futuro, reutilizar `EventosManager` tal cual (ya no depende de `KpiCard`).
- **`site_content` como CMS de imágenes del Home** — además de texto (`hero`, `about`, `stats`, `contact`) y `tour_360_url`, `site_content.content` ahora también guarda URLs de imagen bajo las claves `SITE_IMAGE_KEYS` (`src/lib/uploads/config.ts`): `img_card_boda/quince/empresarial/revelacion`, `img_nosotros`, `img_servicio_catering/fotografia/decoracion`. Se editan desde `/editor/imagenes-sitio` (`ImagenesSitioManager.tsx`) y se leen en `src/app/page.tsx` para pasarlas como props a `EventosSection`/`NosotrosSection`/`ServiciosSection` (con fallback a `/placeholder-evento.svg` (marca, local) si la clave está `null`). `confirmSiteImageUpload`/`deleteSiteImage` (`src/app/actions/editor/imagenes-sitio.ts`) usan `upsert(..., { onConflict: "key" })` en vez de `update` — así funcionan aunque la fila todavía no exista en `site_content` (p. ej. si la migración de seed no se ha corrido en el ambiente).
- **Slider aleatorio del Home** — `pickRandomSliderImages()` (`src/lib/random-slider.ts`) agrupa `gallery_images` publicadas de las categorías `boda/quince/empresarial/revelacion`, reparte 8 cupos lo más parejo posible entre las categorías que tengan al menos una foto (con redistribución si a alguna le faltan fotos para su cupo) y elige al azar dentro de cada una — todo con `Math.random()` en el servidor, así que el resultado cambia en cada request (no es "por sesión de navegador", es por request SSR). Las páginas de evento (`/bodas`, etc.) siguen usando `EventPageTemplate` sin tocar, filtrando solo por su propia categoría.
- **`SliderGaleria` usa `next/image`** — antes usaba `<img>` planas con `object-cover` (correcto en CSS pero sin optimización real del archivo). Ahora usa `<Image fill sizes="100vw" className="object-cover ...">` dentro del mismo contenedor `relative h-[420px] md:h-[580px] overflow-hidden` — Next optimiza/redimensiona el archivo servido. Si una foto sigue viéndose pixelada es porque el original subido es de baja resolución (no se puede arreglar por código; hay que resubir un original de mayor resolución desde `/editor/galeria`).
- **Logout con fallback de redirección** — `logout()` (`src/app/actions/auth.ts`) es una Server Action que hace `redirect("/")`; cuando se invoca como función async normal fuera de un `form action` (p. ej. desde un `setTimeout` de inactividad o un botón `onClick`), esa redirección no siempre se completa. `PortalShell.triggerLogout` y `PortalSidebar.handleLogout` envuelven la llamada en `try { await logout() } finally { window.location.href = "/" }` para garantizar la navegación siempre.
- **ClienteEditForm — bug de foco corregido** — `Section`/`Field` estaban definidos como componentes *dentro* del cuerpo de `ClienteEditForm` (recreados en cada render), lo que hacía que React desmontara y remontara los `<input>` en cada tecla, perdiendo el foco y el valor tecleado. Se movieron a nivel de módulo; `Field` ahora recibe `error?: string` en vez de un nombre de campo + closure. Prop opcional `redirectTo` (default `/portal/planner/clientes`) para reusar el formulario desde `/admin/clientes/[clientId]`.
- **KpiCard** (`src/components/admin/KpiCard.tsx`) — card `rounded-2xl` con ícono en `bg-dorado/10`, extraído de `admin/dashboard/page.tsx` para reusar también en `EventosManager`.

### Pendiente — próximas sesiones

1. **Pruebas completas de todos los módulos** — QA end-to-end de portal cliente, planner, admin y editor antes de seguir sumando funcionalidad nueva.

2. **Mensajería avanzada — pendiente de evaluación con el cliente.** La versión simplificada ya está implementada: `/portal/mensajes` es un link directo a WhatsApp del equipo con mensaje prellenado (ver fila "Mensajería simplificada" arriba). Lo que falta decidir junto con el cliente es si vale la pena avanzar a algo más elaborado — por ejemplo, un grupo de WhatsApp por evento creado/gestionado vía la API de **CallMeBot** (o similar) para automatizar mensajes de estado (recordatorios, confirmaciones) sin depender de que el equipo escriba manualmente. No implementar nada de esto sin validar antes el caso de uso real y el costo/limitaciones de la API elegida.

3. **Distribución de invitados por mesa** (`/portal/invitados`) — tabla `guest_tables`, cliente organiza invitados en mesas con nombre y capacidad.

4. **Conectar dominio hacienda-encanto.com a Vercel** — cuando el sitio esté listo para producción. Cuenta Vercel ya aprobada.

5. **Videos empresarial y revelación** — archivos los provee el cliente. Subirlos desde `/editor/videos` (upload ya funcional), activar para la página correspondiente.

6. **Formulario de contacto redirige a WhatsApp** — cambiar el flujo del formulario de contacto público para que, en vez de (o además de) guardar el mensaje en `contact_messages`, redirija/abra WhatsApp con el mensaje prellenado.

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
        usuarios.ts                               ← crearUsuario, editarUsuario, toggleUsuarioActivo (roles equipo, nunca "client")
      editor/
        galeria.ts                                ← requestGaleriaUpload/confirmGaleriaUpload (signed URL), updateGaleriaImage, deleteGaleriaImage, reorderGaleriaImages
        videos.ts                                 ← requestVideoUpload/confirmVideoUpload (signed URL), activateVideo, deactivateVideo, deleteVideo
        imagenes-sitio.ts                         ← requestSiteImageUpload/confirmSiteImageUpload (signed URL, upsert en site_content), deleteSiteImage
        testimonios.ts                            ← createTestimonio, updateTestimonio, deleteTestimonio
        paquetes.ts                               ← createPaquete, updatePaquete, deletePaquete
        contenido.ts                              ← updateSiteContentText(key, field, value), updateSiteContentData(key, json)
    (auth)/
      login/page.tsx                              ← Formulario de acceso con identidad de marca + link "← Regresar al inicio"
      registro/page.tsx                           ← redirect("/login") — ruta deshabilitada
    portal/
      layout.tsx                                  ← PortalLayout: auth check + fetch profile + PortalShell
      page.tsx                                    ← Redirect por rol a destino específico
      dashboard/page.tsx                          ← Dashboard cliente: saludo, countdown, detalles evento, accesos rápidos
      orden-servicio/page.tsx                     ← Vista cliente: secciones + barra de progreso
      actividades/page.tsx                        ← Timeline del cliente (próximas con borde dorado, pasadas tachadas)
      mensajes/page.tsx                           ← Link directo a WhatsApp con mensaje prellenado (nombre + fecha del evento)
      planner/page.tsx                            ← Panel planner: lista de bookings con enlace a orden
      planner/nuevo-cliente/page.tsx              ← Formulario onboarding cliente (guard: solo planner/admin)
      planner/orden-servicio/[bookingId]/page.tsx ← Orden editable para planner
      planner/clientes/page.tsx                   ← Fetch (fetchClientBookingRows) + ClientesTable (tabs Activos/Cumplidos/Cancelados)
      planner/clientes/[clientId]/actividades/page.tsx ← Vista planner: CRUD actividades del cliente
      asesor-comercial/page.tsx
      asesor-logistica/page.tsx
      staff/page.tsx
    admin/
      layout.tsx                                  ← Solo admin, usa PortalShell
      dashboard/page.tsx                          ← Página única: KPIs (KpiCard) + próximos eventos + contactos recientes + EventosManager (tabla filtrable). Fusiona el antiguo /admin/eventos (eliminado).
      usuarios/page.tsx                           ← UsuariosManager (Equipo, role != client) — sin sección de clientes
      clientes/page.tsx                           ← Fetch (fetchClientBookingRows) + ClientesTable basePath="admin" + botón Nuevo cliente
      clientes/nuevo/page.tsx                     ← Reusa NuevoClienteForm sin modificar
      clientes/[clientId]/page.tsx                ← Vista única: ClienteEditForm + PlannerOrdenForm (edición + orden de servicio)
    editor/
      layout.tsx                                  ← Admin y editor, usa PortalShell
      page.tsx                                    ← redirect("/editor/galeria")
      galeria/page.tsx
      videos/page.tsx
      imagenes-sitio/page.tsx                     ← Fetch site_content (SITE_IMAGE_KEYS) + ImagenesSitioManager
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
      UsuariosManager.tsx                         ← Equipo (staff): tabla + CrearModal + EditarModal + toggleUsuarioActivo, sin rol "client"
      EventosManager.tsx                          ← Tabla filtrable (tabs estado + rango fechas) sobre BookingEventRow[]. Sin KPIs propios — los calcula el caller.
      KpiCard.tsx                                 ← Card rounded-2xl con ícono, reusado en admin/dashboard
    clientes/
      ClientesTable.tsx                           ← Compartido admin/planner: tabs Activos/Cumplidos/Cancelados, prop readOnly
    editor/
      GaleriaManager.tsx                          ← Dos secciones (Publicadas/Archivadas), @dnd-kit/sortable, límite 8/categoría, upload directo a Storage (signed URL)
      VideosManager.tsx                           ← Lista agrupada por página, upload directo a Storage (signed URL), toggle activo, 1 activo por página
      ImagenesSitioManager.tsx                    ← 3 secciones (cards eventos, Nosotros, cards servicios), ImageSlot reusable: preview + Cambiar imagen (signed URL) + Eliminar
      TestimoniosManager.tsx                      ← CRUD inline, StarRating component
      PaquetesManager.tsx                         ← CRUD inline, filtro por tipo, lista incluidos
      ContenidoManager.tsx                        ← Acordeón por key, TextField + JsonField con guardado por campo
    contact/
      ContactForm.tsx
      HomeContactForm.tsx
    ui/
      SubmitButton.tsx
      SliderGaleria.tsx                           ← next/image (fill + object-cover), crossfade opacity, selección de imágenes ya viene resuelta por el caller
      WhatsAppIcon.tsx                            ← SVG oficial, prop color (verde #25D366 por defecto, blanco sobre fondo verde sólido)
  lib/supabase/
    server.ts                                     ← createClient() async (SSR, con sesión)
    client.ts                                     ← createBrowserClient
    admin.ts                                      ← createAdminClient() (service_role, bypasa RLS)
  lib/uploads/
    config.ts                                     ← UPLOAD_KINDS (hero-video, gallery-image, site-image), límites, mime types, path builders, SITE_IMAGE_KEYS/SiteImageKey — sin secretos
    server.ts                                     ← createSignedUpload, publicUrlFor, removeUploadedFile (usa createAdminClient)
    client.ts                                     ← uploadFileToSignedUrl (browser client, sube directo a Supabase Storage)
  lib/clientes.ts                                 ← getClientSegment, ClientBookingRow, fetchClientBookingRows (rpc sync_completed_bookings + query bookings+profiles)
  lib/eventos.ts                                  ← BookingEventRow, fetchAllBookingsWithClient (rpc sync_completed_bookings + todos los bookings+profiles, usado en admin/dashboard)
  lib/random-slider.ts                            ← pickRandomSliderImages: reparte 8 cupos entre categorías con fotos, selección al azar por request
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
  20260625000008_sync_completed_bookings_function.sql ← función security definer, marca bookings vencidos como completed
  20260625000009_schedule_sync_completed_bookings_cron.sql ← pg_cron diario (migración separada por si la extensión falla)
  20260625000010_seed_site_images.sql             ← seed de las 8 claves img_card_*/img_nosotros/img_servicio_* en site_content (on conflict do nothing)
  20260625000011_reseed_test_cliente.sql          ← recrea cliente@test.com + booking + orden de servicio (se habían perdido de auth.users)
```
