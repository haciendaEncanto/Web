@AGENTS.md

---

## Estado del proyecto — Hacienda El Encanto

### Stack
Next.js 16 + TypeScript + Tailwind v4 (`@theme inline {}` en globals.css) + Supabase (PostgreSQL + Storage + Auth). Fuentes: Cormorant Garamond. `pnpm` exclusivamente — nunca `npm install`. Paleta: `--rojo`, `--dorado`, `--crema`, `--negro`, `--verde-bosque`, `--blush`.

### Usuarios de prueba
| Email | Contraseña | Rol |
|---|---|---|
| admin@haciendaencanto.com | Admin2026! | admin |
| editor@haciendaencanto.com | Editor2026! | editor |
| cliente@test.com | (migración 20260625000011) | client |
| dj@haciendaencanto.com | Staff2026! | staff |
| animador@haciendaencanto.com | Staff2026! | staff |

### Módulos completados (todos ✅)

| Módulo | Resumen |
|---|---|
| Fases 0–2 | Entorno, BD (15 tablas + RLS + 4 buckets), Auth (proxy.ts, reCAPTCHA v3, /registro deshabilitado) |
| Home público | NavBar, Hero video loop, 4 cards eventos, Nosotros, Servicios, SliderGalería aleatoria, Testimonios, CTA, Contacto, Footer, WhatsApp flotante |
| Páginas de evento | `EventPageTemplate` reutilizable + 4 rutas: /bodas, /quince-anos, /eventos-empresariales, /revelacion-de-genero. Orden: Hero→Experiencia→Vista360→SliderGalería→Paquetes→Testimonios→Formulario |
| Esquema BD | 8 roles, tablas playlists/guest_tables/calendar_events/service_order_sections/service_order_items/salon_maps |
| Portal base | PortalShell + PortalSidebar + PortalHeader, redirect por rol, dashboard cliente con CountdownTimer |
| Orden de servicio | Vista cliente (barra progreso, aprobar) + vista planner (form completo, inicializar). Modelo dos actores: filled_by planner/client. Música en orden en solo lectura desde tabla playlists |
| Onboarding clientes | /portal/planner/nuevo-cliente: Auth→profile→booking→initialize_service_order con rollback, validación solapamiento de horario |
| Admin + Editor | /admin (solo admin), /editor (admin+editor), roles editor y gerente, RLS is_editor() |
| Actividades | /portal/actividades (timeline cliente) + /portal/planner/clientes/[id]/actividades (CRUD inline planner) |
| Uploads → signed URL | Videos/galería/docs suben directo a Supabase Storage vía signed URL (nunca por Vercel — límite 4.5MB body) |
| Admin dashboard unificado | KPIs + próximos + contactos + EventosManager filtrable. /admin/usuarios solo equipo. /admin/clientes CRUD completo |
| Fallbacks de marca | HeroLogoFallback (dark/light) en hero/cards sin imagen. placeholder-avatar.svg para personas. TransitionOverlay vía portal, IntroOverlay 600ms |
| Documentos y pagos | /portal/documentos + /portal/pagos cliente. Planner sube PDF, cliente sube comprobante, admin confirma. Pagos 100% manual, sin pasarela |
| Mensajería | /portal/mensajes: link directo wa.me/573247836852 con mensaje prellenado (nombre + fecha del evento) |
| Playlist | /portal/playlist: toggle centinela "música propia" + URLs por event_type. PlaylistReadOnly (planner/admin/staff). Campos de música sincronizados a tabla playlists |
| Invitados | /portal/invitados: mapa salón según guest_count + subir/descargar/eliminar Excel (guest_tables). Gestión mapas planner: /portal/planner/salon-mapas |
| Staff acotado | /portal/staff: solo eventos activos + playlist (15 días). Sidebar staff: único ítem "Mis Eventos" |
| Visibilidad 15 días | Solo admin y gerente ven todos los eventos. Resto: próximos 15 días. Roles asesor-comercial/asesor-logistica/gerente con páginas reales |
| QA 118 casos + 6 fixes | OrdenServicioView genérica, push migración quinceañera, drop packages.price, guest_count Zod refine, admin/page.tsx redirect |
| Optimismo en UI | DocumentosPlanner, PagosPlanner, ActividadesPlanner, SalonMapasManager usan useState(initialX) + Server Action devuelve registro creado |
| Imágenes del sitio | /editor/imagenes-sitio: 8 imágenes editables del Home guardadas en site_content, upload signed URL |
| Fotos perfil/testimonios | avatar_url desde /portal/perfil (cliente) y /admin/usuarios (equipo). testimonials.photo_url editable desde /editor/testimonios |

### Decisiones de arquitectura

**Rutas y autenticación**
- `proxy.ts` (no `middleware.ts`) — breaking change Next.js 16. Función exportada como `proxy`. Protege `/portal`, `/admin`, `/editor`.
- Sin API Routes — solo Server Actions en `src/app/actions/`. API Routes solo para webhooks futuros.
- Sin auto-registro público — `/registro` redirige a `/login`. Cuentas las crea admin o wedding_planner.
- **Redirect post-login por rol**: `client → /portal/dashboard`, `admin → /admin/dashboard`, `wedding_planner → /portal/planner`, `asesor_comercial → /portal/asesor-comercial`, `asesor_logistica → /portal/asesor-logistica`, `staff → /portal/staff`, `editor → /editor/galeria`, `gerente → /portal/gerente`.
- `PortalSidebar isActive`: `pathname === href` (igualdad exacta — `startsWith` activa múltiples ítems en subrutas del planner).
- **Logout**: `try { await logout() } finally { window.location.href = "/" }`. Antes del finally: `sessionStorage.setItem("fromLogout", "true")` para que `IntroOverlay` (splash 600ms del Home) no aparezca al volver desde logout.
- `TransitionOverlay` usa `createPortal(document.body)` — un `position:fixed` dentro de un ancestro con `backdrop-filter`/`transform` queda contenido en ese ancestro, no en el viewport.

**Supabase y base de datos**
- `createClient()` (async, SSR) en server.ts para Server Components/Actions. `createBrowserClient` en client.ts. `createAdminClient()` (service_role, bypasa RLS) solo en Server Actions tras verificar rol — `auth.uid()` es NULL con service_role.
- Tipos Supabase: `supabase gen types typescript --project-id oewqyckeqolrpjbjevap > src/types/database.ts` tras cada migración.
- `sync_completed_bookings()` — SQL security definer, marca bookings vencidos como `completed`. Invocado oportunistamente en `fetchClientBookingRows()`/`fetchAllBookingsWithClient()` + pg_cron diario (migración separada — si la extensión falla, no tumba la función).
- `is_staff_or_admin()` incluye `admin`, `staff`, `wedding_planner`, `asesor_comercial`, `asesor_logistica`.
- `initialize_service_order(p_booking_id)` — PL/pgSQL security definer, idempotente (borra y recrea), pre-llena 6 campos de Cabecera desde el booking.
- **Postgres RLS es por fila, no por columna** — no sirve para ocultar un campo en una tabla con `select` público. Por eso se eliminó `packages.price` (era legible con `anon key` vía REST). Nunca exponer campos sensibles en tablas con RLS `select` abierto.
- Solapamiento de horario en `crear-cliente.ts`: `start1 < end2 AND start2 < end1`, extremos de medianoche normalizados con `+1440`. Error reportado en `field: 'event_start_time'`.
- Búsqueda del mapa de salón: `.limit(1)` NO `.maybeSingle()` — si dos mapas activos solapan el mismo rango, `.maybeSingle()` lanza excepción; `.limit(1)` es tolerante.
- `guest_tables`: cada fila = versión histórica del Excel (sin unique en booking_id). Cliente puede borrar sus propias filas; planner solo descarga.

**Uploads — patrón signed URL (crítico)**
- NUNCA pasar archivos por una Server Action — Vercel limita el body a 4.5MB independientemente de `bodySizeLimit`.
- **Patrón 3 pasos**: 1) SA "request" valida tipo/tamaño y genera signed upload URL (expira 5 min) con `createAdminClient().storage.createSignedUploadUrl()`; 2) cliente sube DIRECTO a Supabase Storage con `uploadFileToSignedUrl()` (browser client, el archivo nunca toca Vercel); 3) SA "confirm" inserta/actualiza en BD y borra el archivo si falla.
- Infraestructura en `src/lib/uploads/`: `config.ts` (kinds, límites, mime types, path builders, `SITE_IMAGE_KEYS` — sin secretos, importable desde cliente), `server.ts` (usa createAdminClient), `client.ts` (uploadFileToSignedUrl).
- **Constantes compartidas NUNCA en archivos `"use server"`** — `SITE_IMAGE_KEYS`, `SALON_MAP_CAPACITIES`, `GUEST_COUNT_OPTIONS` viven en módulos `lib/`. Exportar una constante junto a Server Actions rompe en runtime (`X.map is not a function` en el componente que la importa).

**Validaciones**
- Todo `<select>` con valores fijos debe validarse con `.refine()` en Zod del servidor (ver `GUEST_COUNT_OPTIONS`, `SALON_MAP_CAPACITIES`). La restricción HTML no es suficiente.
- `guest_count`: `.refine(v => GUEST_COUNT_OPTIONS.includes(v))` en `crear-cliente.ts` y `editar-cliente.ts`.

**UI y componentes**
- Hero overlay: `from-negro/30 via-negro/5 to-negro/45` (sin capa base plana). Altura: `h-[calc(100dvh-72px)] md:h-[calc(100vh-72px)]`. H1: `absolute bottom-[8%]`. CTA fuera del bloque video, en `<div className="bg-crema">`.
- `<video autoPlay muted loop playsInline>` — `playsInline` obligatorio para reproducción inline en iOS Safari.
- SVGs del sitio: `public/` con `<img>` directo (no `next/image` para SVGs). Logo sidebar: `filter: brightness(0) invert(1)`.
- `SliderGaleria`: `<Image fill sizes="100vw" className="object-cover">`. 8 imágenes, crossfade opacity 3.5s, dots.
- GaleriaManager: secciones Publicadas (`@dnd-kit/sortable`, límite 8/categoría) / Archivadas (escala grises). Upload → Archivadas siempre.
- `site_content` como CMS: claves `img_card_boda/quince/empresarial/revelacion`, `img_nosotros`, `img_servicio_catering/fotografia/decoracion`. Usar `upsert(..., { onConflict: "key" })` en lugar de `update` (la fila puede no existir si el seed no corrió).
- `updateSiteContentText(key, field: "title"|"content", value)` — `field === "title" ? { title } : { content }` (computed property names fallan contra tipos Supabase).
- Slider aleatorio del Home: `pickRandomSliderImages()` reparte 8 cupos entre categorías con `Math.random()` por request SSR.
- **Estado optimista en planner**: Server Actions de crear/editar devuelven `.select().single()`. Componentes mantienen `useState(initialX)` y actualizan de inmediato. `router.refresh()` solo para sync en background (otras pestañas).
- Orden de servicio: `filled_by='client'` solo en sección "Aprobación" (`event_type='all'`, sort 99). Música en tabla `playlists`, la orden la lee en solo lectura via `ORDEN_MUSIC_FIELD_MAP` en `playlist-templates.ts`.
- `OrdenServicioView.tsx` (vista cliente): filtra todas las secciones salvo "Aprobación" ordenadas por `sort_order` — nunca buscar por nombre fijo de sección.
- Segmentación clientes: `getClientSegment(status, isActive)` — cancelados > cumplidos > activos. `ClientesTable` con prop `basePath: "planner" | "admin"`.
- `ClienteEditForm`: `Section`/`Field` definidos a nivel de módulo (nunca dentro del componente — React desmontaría los inputs en cada render perdiendo el foco).
- `hero_videos.event_type`: NULL = home, texto = página específica. Home filtra `.is("event_type", null)`.
- `EventosManager` no calcula KPIs propios — recibe `rows: BookingEventRow[]`; el caller calcula.
- `PlaylistReadOnly`: URLs como texto plano con botón Copiar (`navigator.clipboard`), no como hipervínculos.
- Playlist centinela: `section='centinela'`, `no_aplica=true/false`. Observaciones: `section='observaciones'`, texto en `song_url`.
- reCAPTCHA v3: se omite en dev si `RECAPTCHA_SECRET_KEY` no está configurada.
- Sin precios públicos — paquetes muestran nombre + contenido. CTA siempre "Cuéntanos tu evento" / "Conoce más".

**Restricción de visibilidad por rol**
- `UPCOMING_EVENT_WINDOW_DAYS = 15` en `src/lib/event-window.ts` (único lugar que calcula la ventana).
- Admin y gerente: sin restricción de fecha. Resto (planner, staff, asesores): solo próximos 15 días (`options.restrictToUpcoming`).

### Pendiente

1. **Conectar dominio hacienda-encanto.com a Vercel** — cuenta Vercel ya aprobada.
2. **Videos empresarial y revelación** — pendientes del cliente. Subir desde `/editor/videos`.
3. **Fotos galería empresarial y revelación** — pendientes del cliente.
4. **Tour virtual 360°** — pendiente contratación (Matterport/Kuula). `Vista360.tsx` integrado, botón apunta a `#`. Solo cargar URL en `site_content` cuando exista.
5. **Pruebas con usuarios reales en producción** — tras conectar dominio.

### Archivos clave

```
src/
  app/
    page.tsx                          ← Home público (Server Component, fetch paralelo)
    bodas|quince-anos|eventos-empresariales|revelacion-de-genero/page.tsx  ← EventPageConfig + EventPageTemplate
    actions/
      auth.ts                         ← login (redirect por rol), logout, cierre por inactividad
      contact.ts                      ← submitContactForm (Zod + reCAPTCHA)
      crear-cliente.ts                ← createClientAction: onboarding completo con rollback y overlap check
      orden-servicio.ts               ← savePlannerItems, approveServiceOrder, initServiceOrder
      actividades.ts                  ← createActivity/updateActivity (devuelven ActividadRow), deleteActivity
      invitados.ts                    ← requestGuestListUpload/confirmGuestListUpload, deleteGuestList, getGuestListDownloadUrl
      salon-maps.ts                   ← requestSalonMapUpload/confirmSalonMapUpload (devuelve SalonMapRow), toggleSalonMapActivo, deleteSalonMap
      pagos.ts                        ← registrarPago (devuelve PagoRow), confirmarPago, requestComprobanteUpload/confirmComprobanteUpload
      documentos.ts                   ← requestDocumentoUpload/confirmDocumentoUpload (devuelve {id,created_at}), deleteDocumento, listDocumentosConTamano
      playlist.ts                     ← savePlaylist (upsert onConflict booking_id,section; notifica admin/planner)
      admin/usuarios.ts               ← crearUsuario, editarUsuario, toggleUsuarioActivo (roles equipo, nunca "client")
      editor/galeria.ts               ← requestGaleriaUpload/confirmGaleriaUpload, updateGaleriaImage, reorderGaleriaImages
      editor/videos.ts                ← requestVideoUpload/confirmVideoUpload, activateVideo, deactivateVideo, deleteVideo
      editor/imagenes-sitio.ts        ← requestSiteImageUpload/confirmSiteImageUpload (upsert site_content), deleteSiteImage
      editor/testimonios.ts|paquetes.ts|contenido.ts
    (auth)/login/page.tsx             ← Login con identidad de marca
    portal/
      layout.tsx                      ← auth check + fetch profile + PortalShell
      page.tsx                        ← Redirect por rol
      dashboard/page.tsx              ← CountdownTimer, detalles evento, accesos rápidos
      orden-servicio/page.tsx         ← Vista cliente: secciones + aprobar
      actividades/page.tsx            ← Timeline cliente
      mensajes/page.tsx               ← Link WhatsApp prellenado
      invitados/page.tsx              ← Mapa salón + Excel (subir/descargar/eliminar)
      playlist/page.tsx               ← Toggle centinela + URLs por event_type
      perfil/page.tsx                 ← Avatar del cliente
      planner/page.tsx
      planner/nuevo-cliente/page.tsx
      planner/orden-servicio/[bookingId]/page.tsx
      planner/clientes/page.tsx       ← ClientesTable (tabs Activos/Cumplidos/Cancelados)
      planner/clientes/[clientId]/actividades|invitados|documentos|pagos|playlist/page.tsx
      planner/salon-mapas/page.tsx
      asesor-comercial|asesor-logistica/page.tsx  ← EventosManager 15 días
      gerente/page.tsx                ← EventosManager sin restricción de fecha
      staff/page.tsx                  ← Eventos activos + playlist (15 días), StaffEventsView
    admin/
      page.tsx                        ← redirect("/admin/dashboard")
      dashboard/page.tsx              ← KPIs + próximos eventos + contactos + EventosManager
      usuarios/page.tsx               ← UsuariosManager (solo equipo, nunca rol "client")
      clientes/page.tsx|nuevo/page.tsx|[clientId]/page.tsx|[clientId]/invitados/page.tsx
    editor/
      page.tsx                        ← redirect("/editor/galeria")
      galeria|videos|imagenes-sitio|testimonios|paquetes|contenido/page.tsx
  components/
    home/                             ← NavBar, HeroSection, EventosSection, NosotrosSection, ServiciosSection, SliderGaleria, etc.
    events/                           ← EventPageTemplate, EventHero, Vista360, EventDescripcion, etc.
    portal/
      PortalShell.tsx                 ← Shell sidebar + overlay mobile (reutilizado en admin y editor)
      PortalSidebar.tsx               ← fixed 248px, #0F0F0F, logo blanco, nav por rol, isActive exacto
      PortalHeader.tsx                ← hamburger, título, bell, avatar
      CountdownTimer.tsx
      NuevoClienteForm.tsx            ← useActionState, GUEST_COUNT_OPTIONS select
      InvitadosClienteView.tsx|InvitadosReadOnly.tsx
      orden-servicio/OrdenServicioView.tsx|PlannerOrdenForm.tsx
      planner/ActividadesPlanner.tsx|ClienteEditForm.tsx|SalonMapasManager.tsx|DocumentosPlanner.tsx|PagosPlanner.tsx
    admin/UsuariosManager.tsx|EventosManager.tsx|KpiCard.tsx
    clientes/ClientesTable.tsx        ← Compartido admin/planner, prop basePath: "planner"|"admin"
    editor/GaleriaManager.tsx|VideosManager.tsx|ImagenesSitioManager.tsx|TestimoniosManager.tsx|PaquetesManager.tsx|ContenidoManager.tsx
    ui/SliderGaleria.tsx|WhatsAppIcon.tsx|CopyButton.tsx|SubmitButton.tsx|HeroLogoFallback.tsx
    contact/ContactForm.tsx|HomeContactForm.tsx
  lib/
    supabase/server.ts|client.ts|admin.ts
    uploads/config.ts|server.ts|client.ts  ← patrón signed URL, SITE_IMAGE_KEYS, UPLOAD_KINDS
    clientes.ts                       ← getClientSegment, ClientBookingRow, fetchClientBookingRows (options.restrictToUpcoming)
    eventos.ts                        ← BookingEventRow, fetchAllBookingsWithClient (options.restrictToUpcoming)
    event-window.ts                   ← getUpcomingEventWindow() — UPCOMING_EVENT_WINDOW_DAYS = 15
    playlist-templates.ts             ← PLAYLIST_TEMPLATES por event_type, ORDEN_MUSIC_FIELD_MAP
    random-slider.ts                  ← pickRandomSliderImages (8 cupos, Math.random por request SSR)
    guest-count.ts                    ← GUEST_COUNT_OPTIONS (30–150 de 10 en 10)
    salon-map-capacities.ts           ← SALON_MAP_CAPACITIES (nunca en "use server")
  proxy.ts                            ← Middleware Next.js 16 (función exportada como "proxy")
  types/database.ts                   ← Tipos generados Supabase (regenerar tras cada migración)
public/
  logo-principal-fondo-claro.svg
  trebol-original.svg                 ← Favicon
  placeholder-avatar.svg
  placeholder-evento.svg              ← Placeholder de marca local (nunca dependencias externas)
supabase/migrations/
  (última aplicada: 20260722000000_drop_packages_price.sql — ver git log para historial completo)
```
