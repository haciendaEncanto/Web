@AGENTS.md

---

## Estado del proyecto — Hacienda El Encanto

### Stack
Next.js 16 + TypeScript + Tailwind v4 (`@theme inline {}` en globals.css) + Supabase (PostgreSQL + Auth). Fuentes: Cormorant Garamond. `pnpm` exclusivamente. Paleta: `--rojo`, `--dorado`, `--crema`, `--negro`, `--verde-bosque`, `--blush`. **Supabase Storage no se usa** — todos los archivos van a Colombia Hosting.

### Usuarios de prueba
| Email | Contraseña | Rol |
|---|---|---|
| admin@hacienda-encanto.com | Admin2026! | admin |
| editor@hacienda-encanto.com | Editor2026! | editor |
| planner@hacienda-encanto.com | Planner2026! | wedding_planner |
| asesor@hacienda-encanto.com | Asesor2026! | asesor_comercial |
| jeissondeejay11@gmail.com | DJ2026! | staff |
| cliente@test.com | (migración 20260625000011) | client |
| ing_jeisson_rincon@outlook.com | — | client |

Dominio anterior `@haciendaencanto.com` (sin guión) eliminado en migración 20260725000003.

### Módulos completados (todos ✅)
- **Fases 0–2**: BD (15 tablas + RLS + 4 buckets), Auth (proxy.ts, reCAPTCHA v3, /registro deshabilitado)
- **Home público**: NavBar, Hero video loop, EventosSection, NosotrosSection, ServiciosSection, SliderGalería aleatoria, TestimoniosSection (reproductor 10 clips + cards texto), CTA, Contacto, Footer, WhatsApp flotante
- **Páginas evento**: `EventPageTemplate` + 4 rutas (/bodas, /quince-anos, /eventos-empresariales, /revelacion-de-genero). Orden: Hero→Experiencia→[Vista360]→SliderGalería→Paquetes→Testimonios→Formulario
- **Portal**: PortalShell + Sidebar + Header, redirect por rol, dashboard cliente con CountdownTimer
- **Orden de servicio**: vista cliente (barra progreso, aprobar) + vista planner (form completo). `filled_by` planner/client. Música en solo lectura desde `playlists`
- **Onboarding**: /planner/nuevo-cliente Auth→profile→booking con rollback y overlap check. Orden de servicio se inicializa en `aprobarContrato`, NO aquí. Botón "Crear cliente →"
- **Contrato**: ContractItemsForm (Sí/No + cantidades + texto). PDF vía SA server-side. 20 cláusulas en site_content. Flujo: generar→cliente aprueba→lock→inicializa orden
- **Módulos portal**: Actividades (timeline), Documentos, Pagos (manual, sin pasarela), Playlist (centinela + URLs), Invitados (mapa salón + Excel), Mensajes (WhatsApp prellenado), Perfil
- **Admin**: dashboard (KPIs + próximos + contactos + EventosManager), /admin/usuarios (equipo), /admin/clientes (CRUD + tabs idénticos al planner)
- **Editor**: galería (dnd-kit, límite 8/cat), videos, imágenes-sitio (8 claves site_content), testimonios, paquetes, contenido (cláusulas + datos hacienda)
- **Tabs ficha cliente**: /planner/clientes/[id]/ y /admin/clientes/[id]/ — tabs Contrato/Actividades/Invitados/Documentos/Pagos/Playlist vía `ClienteTabNav`
- **Permisos asesor**: lista clientes + tabs Editar/Documentos/Contrato/Pagos (NO Playlist/Invitados/Actividades). Orden de servicio restringida a planner/admin
- **Flujo contacto**: whatsapp requerido, round-robin vía asesor_assignments, CallMeBot fire & forget. Panel /asesor-comercial con contactos asignados
- **Seguridad**: HTTP headers en next.config.ts (CSP, X-Frame-Options, etc.), rate limiting login (login_attempts, 15 min, máx 5 fallos), Zod en SAs
- **Resiliencia Supabase outage (ago 2026)**: queries en try/catch con defaults tipados. Videos hero y galería hardcodeados a Colombia Hosting. CSP + remotePatterns incluyen `contenido.hacienda-encanto.com`
- **Recuperación contraseña**: /reset-password + /update-password (token_hash PKCE browser-side). Admin: CambiarPasswordButton vía `admin.updateUserById`
- **Staff y Blog** (2026-08-10): tablas `staff` + `blog_posts` (migración 20260810000001). Módulo staff: CRUD + hover overlay en home. Módulo blog: CRUD + auto-slug + `/blog` + `/blog/[slug]` con sidebar. Fotos vía PHP Colombia Hosting
- **StaffSection home** (2026-08-11): 4 miembros hardcodeados en fallback — Jonny Delgado, David Castillo, DJ Jeisson Evolution, DJ Piper Pimienta (en ese orden). Grid 2 cols móvil / 4 cols desktop. Hover overlay con reseña. Texto informativo equipo de servicio debajo de las cards (Helvetica, #5A5A58).
- **AlianzasSection home** (2026-08-17): tabla `staff` con columnas `is_aliado_externo BOOLEAN DEFAULT false` y `frase TEXT` (migración 20260817000001). Sección "De la mano con los mejores" — cards circular con nombre, especialidad (cargo) y frase en cursiva. Se oculta automáticamente si no hay aliados en BD (sin fallback hardcodeado). En home page.tsx: query único a `staff`, separado en `staffMembers` (is_aliado_externo=false) y `aliados` (is_aliado_externo=true). Editor `/editor/staff`: toggle "Es aliado externo" + campo "Frase / Leyenda" (aparece condicionalmente); lista con badge dorado "Aliado". Aliado de prueba en BD: Jaime Guarín — Fotografía & Video — "Cada instante merece ser eterno".
- **Rate limiting formulario contacto** (2026-08-18): doble capa. Capa 1 cliente (`useContactRateLimit` en `src/lib/contact-rate-limit.ts`): localStorage `contact_last_sent` + `contact_backoff_minutes`; inicia en 5 min, cada intento bloqueado duplica hasta 180 min máx; cuenta regresiva en segundos visible en el formulario; botón deshabilitado mientras activo. Capa 2 servidor (`contact.ts`): tabla `contact_attempts(ip, attempts, last_attempt_at, blocked_until)` (migración 20260818000001); IP extraída de `x-forwarded-for`/`x-real-ip`; máx 3 intentos por hora; bloqueo exponencial 1h→2h→3h; usa `createRawAdminClient()` (tabla no en database.ts aún); fallo silencioso si Supabase no responde. Aplicado en `ContactForm` y `HomeContactForm` (home + 4 páginas evento). `SubmitButton` extendido con prop `disabled` externa.
- **Otros**: SEO (sitemap.ts + robots.ts App Router nativos), reCAPTCHA badge oculto + texto legal, sin precios públicos, pestaña Cancelados eliminada de UI (bookings siguen en BD)

### Decisiones de arquitectura

**Rutas y autenticación**
- `proxy.ts` (no `middleware.ts`) — breaking change Next.js 16. Función exportada como `proxy`. Protege `/portal`, `/admin`, `/editor`.
- Sin API Routes — solo Server Actions en `src/app/actions/`. Sin auto-registro — `/registro` → `/login`.
- **Redirect post-login por rol**: `client→/portal/dashboard`, `admin→/admin/dashboard`, `wedding_planner→/portal/planner`, `asesor_comercial→/portal/asesor-comercial`, `asesor_logistica→/portal/asesor-logistica`, `staff→/portal/staff`, `editor→/editor/galeria`, `gerente→/portal/gerente`.
- `PortalSidebar isActive`: `pathname === href` (exacto, no `startsWith` — activa múltiples ítems en subrutas).
- **Logout**: `try { await logout() } finally { window.location.href = "/" }`. Antes: `sessionStorage.setItem("fromLogout","true")` para que IntroOverlay no aparezca.
- `TransitionOverlay` usa `createPortal(document.body)` — `position:fixed` dentro de ancestro con `backdrop-filter`/`transform` queda contenido en ese ancestro.

**Supabase y base de datos**
- `createClient()` (async, SSR) para Server Components/Actions. `createBrowserClient` en client.ts. `createAdminClient()` (service_role) solo en SAs tras verificar rol — `auth.uid()` es NULL con service_role.
- Tipos: `supabase gen types typescript --project-id oewqyckeqolrpjbjevap > src/types/database.ts` tras cada migración. **Tablas nuevas antes de regenerar**: usar `createRawAdminClient()` (sin genérico `Database<>`) en SAs, y `const db: any = supabase` en Server Components.
- `sync_completed_bookings()` — security definer, marca bookings vencidos. Invocado en `fetchClientBookingRows()`/`fetchAllBookingsWithClient()` + pg_cron diario.
- `is_staff_or_admin()` incluye `admin`, `staff`, `wedding_planner`, `asesor_comercial`, `asesor_logistica`.
- `initialize_service_order(p_booking_id)` — idempotente (borra y recrea). **Labels críticos**: `'Hora inicio'` y `'Hora fin'` (sin "de") — deben coincidir exactamente con `service_order_templates`. Migración `20260730000001` normaliza ambos.
- **RLS es por fila, no columna** — nunca exponer campos sensibles en tablas con `select` abierto (razón por la que se eliminó `packages.price`).
- Solapamiento horario en `crear-cliente.ts`: `start1 < end2 AND start2 < end1`, extremos medianoche +1440. Error en `field: 'event_start_time'`.
- Búsqueda mapa salón: `.limit(1)` NO `.maybeSingle()` — tolerante si dos mapas solapan el mismo rango.
- `guest_tables`: cada fila = versión histórica Excel (sin unique en booking_id).

**Uploads — Colombia Hosting vía PHP (arquitectura definitiva)**
- **Supabase Storage NO se usa** para ningún tipo de archivo. Todos los uploads van a `contenido.hacienda-encanto.com`.
- NUNCA pasar archivos por SA — Vercel limita body a 4.5MB. El cliente sube DIRECTO al servidor PHP.
- **Patrón 2 pasos**: 1) cliente llama `uploadToColombiaHosting(file|buffer, folder)` (`src/lib/uploads/colombia-hosting.ts`) que hace POST a `https://contenido.hacienda-encanto.com/upload.php`; 2) el script PHP valida mime, tamaño, guarda en la carpeta y devuelve `{ success, url }`. La URL se guarda en BD via SA.
- `uploadToColombiaHosting` acepta `File | Buffer`. Cuando es `Buffer` (SA server-side), lo envuelve en `Blob` con `type:"application/pdf"`. Tipo `ColombiaFolder`: `"galeria/staff" | "galeria/blog" | "documentos/contratos"`.
- **Script PHP**: `scripts/upload-colombia-hosting.php` → desplegado como `public_html/upload.php`. CORS desde `https://www.hacienda-encanto.com`. Acepta imágenes JPG/PNG/WebP (5 MB) y PDFs (10 MB). Prefijo `img_` para imágenes, `doc_` para PDFs.
- **Carpetas en Colombia Hosting** (todas creadas en cPanel): `public_html/galeria/staff/`, `public_html/galeria/blog/`, `public_html/galeria/`, `public_html/videos/`, `public_html/testimonios/`, `public_html/documents/`, `public_html/documentos/contratos/`.
- **PDF de contrato** (2026-08-11): `generar-contrato.ts` usa `uploadToColombiaHosting(pdfBuffer, "documentos/contratos")`. Supabase Storage ya NO se usa para nada. `eliminarHistorialContratos` solo borra registro BD (sin delete en Colombia Hosting — no hay endpoint).
- `src/lib/uploads/config.ts` (SITE_IMAGE_KEYS, kinds, límites — sin secretos, importable desde cliente).
- **Constantes compartidas NUNCA en `"use server"`** — `SITE_IMAGE_KEYS`, `SALON_MAP_CAPACITIES`, `GUEST_COUNT_OPTIONS` en módulos `lib/`. Exportarlas junto a SAs rompe en runtime (`X.map is not a function`).
- **Funciones síncronas NUNCA en `"use server"`** — Next.js exige que todos los exports de esos archivos sean async. Mover helpers como `generateSlug` a `src/lib/blog-utils.ts` (módulo plano).

**Validaciones**
- Todo `<select>` fijo: validar con `.refine()` Zod en servidor (restricción HTML no es suficiente).
- `guest_count`: `.refine(v => GUEST_COUNT_OPTIONS.includes(v))` en `crear-cliente.ts` y `editar-cliente.ts`.
- `whatsapp`: `.refine()` con `/^(\+?57)?3\d{9}$/` (no `.regex()` — obsoleto en Zod v4).

**UI y componentes**
- Hero overlay: `from-negro/30 via-negro/5 to-negro/45`. Altura: `h-[calc(100dvh-72px)] md:h-[calc(100vh-72px)]`. H1: `absolute bottom-[8%]`. CTA en `<div className="bg-crema">`.
- `<video autoPlay muted loop playsInline>` — `playsInline` obligatorio iOS Safari.
- SVGs: `public/` con `<img>` directo (no `next/image`). Logo sidebar: `filter: brightness(0) invert(1)`.
- `SliderGaleria`: `<Image fill sizes="100vw" className="object-cover object-center">`. 8 imágenes, crossfade 3.5s, dots.
- `site_content` como CMS: usar `upsert(..., { onConflict: "key" })` (la fila puede no existir si el seed no corrió).
- `updateSiteContentText(key, field, value)` — `field === "title" ? { title } : { content }` (computed property names fallan contra tipos Supabase).
- **Estado optimista**: SAs de crear/editar devuelven `.select().single()`. `useState(initialX)` + update inmediato. `router.refresh()` solo para sync en background.
- Orden de servicio: `filled_by='client'` solo en sección "Aprobación" (sort 99). `OrdenServicioView` filtra por `sort_order` — nunca buscar por nombre fijo.
- `ClienteEditForm`: `Section`/`Field` a nivel de módulo (no dentro del componente — React pierde el foco en cada render).
- `hero_videos.event_type`: NULL=home, texto=página específica. Home filtra `.is("event_type", null)`.
- Playlist centinela: `section='centinela'`, `no_aplica`. Observaciones: `section='observaciones'`, texto en `song_url`.
- `PlaylistReadOnly`: URLs como texto plano con botón Copiar, no como hipervínculos.
- Sin precios públicos — CTA siempre "Cuéntanos tu evento" / "Conoce más".
- **TestimoniosSection** (`"use client"`): siempre renderiza. 10 clips Colombia Hosting (`testimonios/1.mp4`–`10.mp4`), `controlsList="nodownload"`, `onEnded` auto-avanza (wraparound). Dots + contador X/10. Cards texto debajo si Supabase responde.
- **Colombia Hosting fallback**: `FALLBACK_IMG`/`FALLBACK_IMAGES` a nivel de módulo. Videos hero hardcodeados en page.tsx y EventPageTemplate. Queries Supabase en try/catch con defaults tipados.

**Flujo de contacto WhatsApp**
- Round-robin: `asesor_assignments` ordenado `total_assignments ASC, last_assigned_at ASC NULLS FIRST`. Comparador usa `!== null` explícito (no falsiness — para no saltar asesores con 0 asignaciones).
- CallMeBot: fire & forget, nunca bloquea. Usa `CALLMEBOT_PHONE_CENTRAL + CALLMEBOT_API_KEY_CENTRAL` si configuradas.
- `contact_status`: `unread|read|replied|en_proceso`. RLS: asesor_comercial → solo asignados; wedding_planner/admin/gerente → todos (via `is_admin_or_gerente()`).
- `profiles.phone`: privado — solo seleccionado en `/admin/usuarios`.

**Módulo de contrato**
- Al cargar, siempre mergear: `{ ...DEFAULT_CONTRACT_ITEMS, ...booking.contract_items }`.
- `ContractFieldType`: `"sino-fixed-1"` (muestra "1"), `"sino"` (muestra "Sí"/"ILIMITADO"), `"cantidad"` (oculto si ≤0), `"texto"` (oculto si vacío).
- Auto-fill al cargar ContractItemsForm: `canelazo`, `champana`, `mobiliario`, `menaje` ← `guest_count` si aún son 0.
- `bookings.valor_segundo_abono`/`valor_tercer_abono` (numeric, nullable — migración 20260731000002). Template vars `{{valor_segundo_abono}}`/`{{valor_tercer_abono}}` formateados con `fmtMoney()` (muestra "—" si null).
- **ContratoPDF — una sola `<Page>`**: nunca dos Pages (genera página en blanco). Header/footer `fixed` repiten en cada página.
- **PDF server-side**: `renderToBuffer` en SA → `uploadToColombiaHosting(pdfBuffer, "documentos/contratos")`. Supabase Storage eliminado del flujo de contratos.
- `sanitizeName`: `normalize("NFD").replace(/[̀-ͯ]/g, "")` con escape Unicode explícito — caracteres literales en el rango se corrompen según encoding del archivo.
- 20 cláusulas (`contrato_clausula_1..20` en site_content). Testimonios y cláusulas con fetch y estado **separados** en ContenidoManager.
- `aprobarContrato`: ownership check → lock → `initialize_service_order` → notifica planners/admins.
- Prereqs para generar PDF: CC, dirección, teléfono, email, valor_total, valor_anticipo.
- **CRÍTICO**: cláusulas 3-20 renderizan `{renderTemplate(c.text, templateVars)}`, no `{c.text}` plano.
- `eliminarHistorialContratos`: solo cuando `contract_locked=false`.

**Seguridad HTTP**
- `next.config.ts` `headers()` async con `source:"/(.*)"`: `X-Frame-Options:DENY`, `X-Content-Type-Options:nosniff`, `Referrer-Policy:strict-origin-when-cross-origin`, `Permissions-Policy`, CSP.
- CSP: `script-src` incluye `static.cloudflareinsights.com`; `img-src`/`media-src`/`connect-src` incluyen `contenido.hacienda-encanto.com` y SUPABASE_HOST; `frame-src https://www.google.com https://maps.google.com` (el iframe del mapa usa `maps.google.com` — sin este dominio muestra "contenido bloqueado").
- Rate limiting login: tabla `login_attempts` (RLS `USING(false)`), 15 min, máx 5 fallos, delay `Math.min(2^(failures-1),16)*1000ms`. Limpia expirados en background.
- Rate limiting contacto: tabla `contact_attempts(ip PK, attempts, last_attempt_at, blocked_until)`. Máx 3 envíos/hora por IP; bloqueo exponencial 1h→2h→3h (máx). Capa cliente: `useContactRateLimit` con localStorage, backoff 5→10→20→40→80→160→180 min, duplica en cada intento bloqueado, reset a 5 cuando el tiempo expira. `x-forwarded-for` para IP real en Vercel.

**Recuperación de contraseña — flujo token_hash**
- `resetPasswordForEmail(email, { redirectTo: ".../update-password" })` — link enviado con `?token_hash=XXXX&type=recovery`.
- `/update-password` (standalone, fuera de `(auth)`): lee `token_hash`+`type` → `verifyOtp({ token_hash, type:"recovery" })` browser-side. Estados: `loading→expired→ready`. Al éxito: `window.history.replaceState` limpia URL.
- `updatePassword` SA: `supabase.auth.updateUser({ password })` con server client (lee cookies del browser client) → `redirect()` por rol.
- `auth/confirm/route.ts` existe pero **no se usa para password reset**.
- Supabase Dashboard: template Reset Password usa `{{ .ConfirmationURL }}`; Redirect URLs incluyen `/update-password`.
- Admin cambia contraseña: `cambiarPassword` SA usa `createAdminClient().auth.admin.updateUserById(userId, { password })`.

**Visibilidad por rol**
- `UPCOMING_EVENT_WINDOW_DAYS=15` en `src/lib/event-window.ts`. Admin y gerente sin restricción. Resto: solo próximos 15 días (`options.restrictToUpcoming`).
- `fetchClientBookingRows` en /planner/clientes siempre con `restrictToUpcoming:false` (gestión, no agenda).

### Producción

Live en **https://www.hacienda-encanto.com**. Dominio Vercel. Código 100% completo. Último estado: 2026-08-18 (tarde).

**⚠ Supabase bloqueado hasta el 20 ago 2026** (quota excedida). Site público funciona con fallbacks Colombia Hosting. Portal/admin no disponibles. Cuando se restaure: try/catch en page.tsx, EventPageTemplate y contact.ts funcionarán automáticamente.

### Pendiente (operativo/contenido, no código)

1. **Restaurar Supabase (20 ago 2026)** — automático vía try/catch ya existentes.
2. **Aplicar migraciones pendientes** con `supabase db push`: `20260810000001` (`staff` + `blog_posts`), `20260817000001` (`is_aliado_externo` + `frase` + seed Jaime Guarín), `20260818000001` (`contact_attempts`) y `20260818000002` (seed artículo blog XV 2026 tendencias); luego regenerar `src/types/database.ts`.
3. **Videos y fotos empresarial/revelación** — subir desde `/editor/videos` y `/editor/galeria` cuando el cliente los entregue.
4. **Tour 360°** — cargar URL en site_content clave `tour_360_url` desde `/editor/contenido`. Vista360.tsx ya oculta si no hay URL.
5. **Registrar asesores en CallMeBot** — enviar `I allow callmebot.com to send me messages` al `+1(347)798-2047`, configurar `CALLMEBOT_API_KEY_CENTRAL` en Vercel.
6. **Verificar Supabase Dashboard** — Rate Limits, JWT expiry 3600s, RLS en todas las tablas.
7. **Pruebas usuarios reales** — Jonny Delgado (planner) y David Castillo (asesor): crear cliente→contrato→aprobación→orden→documentos→pagos.

### Archivos clave

```
src/
  app/
    page.tsx                          ← Home público (Server Component)
    bodas|quince-anos|eventos-empresariales|revelacion-de-genero/page.tsx
    sitemap.ts / robots.ts            ← App Router nativos (no next-sitemap)
    update-password/page.tsx          ← standalone (fuera de (auth)); verifyOtp browser-side
    actions/
      auth.ts                         ← login (redirect por rol), logout, requestPasswordReset, updatePassword
      contact.ts                      ← submitContactForm (Zod + IP rate limit + reCAPTCHA + round-robin + CallMeBot)
      contactos-asesor.ts / crear-cliente.ts / contrato-aprobacion.ts / contrato-items.ts
      orden-servicio.ts / actividades.ts / invitados.ts / salon-maps.ts / pagos.ts / documentos.ts / playlist.ts
      admin/usuarios.ts               ← crearUsuario, editarUsuario, toggleUsuarioActivo, cambiarPassword
      admin/generar-contrato.ts       ← generarContratoPDF (renderToBuffer → Colombia Hosting), eliminarHistorialContratos
      editor/galeria.ts|videos.ts|imagenes-sitio.ts|testimonios.ts|paquetes.ts|contenido.ts
      editor/staff.ts|blog.ts            ← CRUD Staff/Blog con createRawAdminClient()
    blog/page.tsx / blog/[slug]/page.tsx ← públicas; sidebar "Más artículos" en [slug]
    editor/staff/page.tsx / editor/blog/page.tsx
    (auth)/login/page.tsx / reset-password/page.tsx
    auth/confirm/route.ts             ← auxiliar, no se usa para password reset
    portal/layout.tsx / page.tsx (redirect por rol)
    portal/dashboard / orden-servicio / actividades / mensajes / invitados / playlist / perfil
    portal/planner/ (nuevo-cliente, clientes, salon-mapas, orden-servicio/[bookingId])
    portal/planner/clientes/[clientId]/ (contrato, actividades, invitados, documentos, pagos, playlist)
    portal/asesor-comercial / asesor-logistica / gerente / staff
    admin/ (page→redirect, dashboard, usuarios, clientes, clientes/[clientId])
    editor/ (page→redirect, galeria, videos, imagenes-sitio, testimonios, paquetes, contenido)
  components/
    home/ (StaffSection, AlianzasSection, ...) / events/ / portal/ / asesor/ / admin/ / contrato/ / clientes/ / editor/ / ui/ / contact/
    portal/PortalShell.tsx|PortalSidebar.tsx|PortalHeader.tsx
    portal/planner/ContractItemsForm.tsx|ContratoPlanner.tsx|ClienteEditForm.tsx
    contrato/ContratoPDF.tsx          ← Document+Page única, header/footer fixed, tabla 4 cols, 20 cláusulas
    admin/CambiarPasswordButton.tsx   ← reutilizable en /admin/usuarios y /admin/clientes/[id]
    clientes/ClientesTable.tsx        ← prop basePath:"planner"|"admin"
    asesor/ContactosAsesorView.tsx    ← estado optimista, botón wa.me completo
  lib/
    supabase/server.ts|client.ts|admin.ts  ← admin.ts incluye createRawAdminClient()
    uploads/config.ts|server.ts|client.ts
    uploads/colombia-hosting.ts            ← uploadToColombiaHosting(file|buffer, folder) vía PHP; ColombiaFolder incluye "documentos/contratos"
    blog-utils.ts                          ← generateSlug (función síncrona — NO en "use server")
    clientes.ts / eventos.ts / event-window.ts / playlist-templates.ts (ORDEN_MUSIC_FIELD_MAP)
    random-slider.ts / guest-count.ts / salon-map-capacities.ts / callmebot.ts / contract-items.ts
    contact-rate-limit.ts                  ← hook useContactRateLimit (localStorage backoff 5→180 min)
  proxy.ts                            ← Middleware Next.js 16 (exportado como "proxy")
  types/database.ts                   ← Regenerar con supabase gen types tras cada migración
next.config.ts                        ← HTTP security headers vía async headers()
public/ (logo-principal-fondo-claro.svg, trebol-original.svg, placeholder-avatar.svg, placeholder-evento.svg)
scripts/upload-colombia-hosting.php   ← Desplegar como public_html/upload.php en Colombia Hosting
supabase/migrations/ (última creada: 20260818000001_contact_attempts.sql — pendiente de aplicar con supabase db push)
```
