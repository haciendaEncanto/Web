@AGENTS.md

---

## Estado del proyecto — Hacienda El Encanto

### Stack
Next.js 16 + TypeScript + Tailwind v4 (`@theme inline {}` en globals.css) + Supabase (PostgreSQL + Storage + Auth). Fuentes: Cormorant Garamond. `pnpm` exclusivamente — nunca `npm install`. Paleta: `--rojo`, `--dorado`, `--crema`, `--negro`, `--verde-bosque`, `--blush`.

### Usuarios de prueba
| Email | Contraseña | Rol | Nombre |
|---|---|---|---|
| admin@hacienda-encanto.com | Admin2026! | admin | Admin Hacienda |
| editor@hacienda-encanto.com | Editor2026! | editor | Editor Hacienda |
| planner@hacienda-encanto.com | Planner2026! | wedding_planner | Jonny Delgado |
| asesor@hacienda-encanto.com | Asesor2026! | asesor_comercial | David Castillo |
| jeissondeejay11@gmail.com | DJ2026! | staff | Staff DJ |
| cliente@test.com | (migración 20260625000011) | client | — |
| ing_jeisson_rincon@outlook.com | — | client | jeisson yebrail rincon ariza |

Dominio anterior `@haciendaencanto.com` (sin guión) eliminado en migración 20260725000003.

### Módulos completados (todos ✅)

| Módulo | Resumen |
|---|---|
| Fases 0–2 | Entorno, BD (15 tablas + RLS + 4 buckets), Auth (proxy.ts, reCAPTCHA v3, /registro deshabilitado) |
| Home público | NavBar, Hero video loop, 4 cards eventos, Nosotros, Servicios, SliderGalería aleatoria, Testimonios (reproductor de video + cards texto), CTA, Contacto, Footer, WhatsApp flotante |
| Páginas de evento | `EventPageTemplate` reutilizable + 4 rutas: /bodas, /quince-anos, /eventos-empresariales, /revelacion-de-genero. Orden: Hero→Experiencia→[Vista360 solo si hay URL]→SliderGalería→Paquetes→Testimonios→Formulario |
| Esquema BD | 8 roles, tablas playlists/guest_tables/calendar_events/service_order_sections/service_order_items/salon_maps |
| Portal base | PortalShell + PortalSidebar + PortalHeader, redirect por rol, dashboard cliente con CountdownTimer |
| Orden de servicio | Vista cliente (barra progreso, aprobar) + vista planner (form completo, inicializar). Modelo dos actores: filled_by planner/client. Música en orden en solo lectura desde tabla playlists |
| Onboarding clientes | /portal/planner/nuevo-cliente: Auth→profile→booking con rollback y validación solapamiento de horario. La orden de servicio ya NO se inicializa aquí — se difiere a la aprobación del contrato. |
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
| Flujo contacto WhatsApp | Campo whatsapp requerido en formularios. Round-robin de asesores vía asesor_assignments (corregido: comparador usa `!== null` explícito, no falsiness, para no saltar asesores con 0 asignaciones). Notificación CallMeBot con logs de diagnóstico en consola (fire & forget). Panel /portal/asesor-comercial con lista de contactos asignados, panel de detalle por lead, cambio de estado con dropdown (fix en último lead de la lista), botón wa.me con mensaje completo (nombre + evento + fecha + teléfono) |
| Badge reCAPTCHA oculto | `.grecaptcha-badge { visibility: hidden }` en globals.css. Texto legal "Protegido por reCAPTCHA — Política de privacidad y Términos de servicio de Google" en ambos formularios de contacto |
| SEO | `src/app/sitemap.ts` + `src/app/robots.ts` nativos de App Router. Disallow: /portal/ /admin/ /editor/ /login /api/. No usar next-sitemap — no funciona en Vercel con App Router. |
| Gestión de contraseñas | /reset-password: formulario email → resetPasswordForEmail. /update-password: intercambia código PKCE client-side y muestra form nueva contraseña. Admin puede cambiar contraseña de cualquier usuario desde /admin/usuarios y /admin/clientes/[id] vía CambiarPasswordButton + cambiarPassword SA. |
| Módulo de contrato | ContractItemsForm: ítems con toggles Sí/No, cantidades numéricas y texto libre. Tipos: `sino` (Gaseosa/Cóctel → "ILIMITADO"), `sino-fixed-1` (DJ/Maestro → muestra "1"), `cantidad` (numérico, oculto si ≤ 0), `texto` (libre, oculto si vacío). Nuevos ítems: `pirotecnia` y `polvora_fria` (Sí/No + cantidad). DJ/Maestro/Sonido/Luces/etc con campos numéricos. Auto-fill de cantidades (Canelazo, Champaña, Mobiliario, Menaje) basado en `guest_count`. Campos `valor_segundo_abono` y `valor_tercer_abono` en bookings (migración 20260731000002); visibles en formularios planner/admin y como vars `{{valor_segundo_abono}}` / `{{valor_tercer_abono}}` en cláusulas PDF. Generación PDF via SA generarContratoPDF: nombre `{TipoEvento} {DD-MM-YYYY} {NombreCliente}`, upload directo a Storage server-side. ContratoPDF: página única, header/footer fijos, tabla 4 columnas solo ítems activos, **20 cláusulas** (claves `contrato_clausula_1..20` en site_content) — cláusulas 1-2 en párrafo introductorio, 3-20 texto corrido. Botón '+' en /editor/contenido para agregar cláusulas dinámicamente hasta el máximo. Fix testimonios/cláusulas no mezclados en ContenidoManager (fetch y estado separados). Datos hacienda y cláusulas editables desde site_content. Flujo aprobación: aprobarContrato bloquea + inicializa orden de servicio + notifica. Vista cliente: Aprobar / Solicitar ajustes. Prereqs para generar: CC, dirección, teléfono, email del cliente. Botón "Eliminar historial" en ContratoPlanner (solo contract_locked=false). |
| Tabs ficha cliente planner y admin | `/portal/planner/clientes/[clientId]/` tiene tabs: Contrato / Actividades / Invitados / Documentos / Pagos / Playlist. `/admin/clientes/[clientId]/` tiene la misma estructura con layout propio (auth admin, breadcrumb, CambiarPasswordButton) y tabs idénticos via `ClienteTabNav` con prop `basePath="/admin/clientes"`. `page.tsx` redirige a `/editar` en ambos. |
| Permisos asesor comercial | Asesor comercial accede a: `/portal/planner/clientes` (lista), tabs Editar/Documentos/Contrato/Pagos (NO Playlist/Invitados/Actividades). ClienteTabNav filtra tabs según rol. Orden de servicio restringida a wedding_planner y admin (asesor excluido). SAs permitidas para asesor: saveContractItems, generarContratoPDF, requestDocumentoUpload/confirmDocumentoUpload, registrarPago/confirmarPago, editarCliente. Sidebar asesor: "Eventos y Contactos" + "Clientes". No se necesitó migración RLS — is_staff_or_admin() ya incluía asesor_comercial. |
| Onboarding clientes (actualizado) | createClientAction YA NO inicializa la orden de servicio — solo crea Auth + profile + booking. La orden se inicializa dentro de aprobarContrato cuando el cliente aprueba. Botón "Crear cliente →" (antes "Crear cliente y generar orden →"). fetchClientBookingRows en /planner/clientes siempre con restrictToUpcoming:false (gestión, no agenda). |
| Auditoría de seguridad | HTTP Security Headers en next.config.ts (X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy, CSP con SUPABASE_HOST). Rate limiting login: tabla `login_attempts` (PostgreSQL, RLS false), ventana 15 min, máx 5 fallos, delay progresivo `Math.pow(2, failures-1)*1000ms`. Zod en `requestPasswordReset`. 7 vectores auditados; hallazgos críticos corregidos. |
| Eliminación cancelar eventos | Opción "Cancelar evento" eliminada de la interfaz del cliente. Pestaña "Cancelados" eliminada de ClientesTable en admin y planner — el segmento cancelado ya no es visible en la UI (los bookings cancelados siguen en BD). |
| Documentación del proyecto | Documentación técnica, manual de usuario, acta de entrega y manual de administración del sistema generados en PDF con logo de la hacienda. Entregados al cliente. No requieren código adicional. |
| Resiliencia Supabase outage (ago 2026) | Supabase bloqueado por quota excedida hasta el 20 ago 2026. Solución: (1) Todas las queries Supabase en page.tsx / EventPageTemplate / contact.ts envueltas en try/catch con defaults tipados. (2) Videos hero hardcodeados en page.tsx y EventPageTemplate (Colombia Hosting). (3) Galería slider hardcodeada en page.tsx, bodas/page.tsx, quince-anos/page.tsx (bodas 1–9.jpeg; quinces 1–2.jpeg + 3–4.png + 5–8.jpeg). (4) EventosSection / ServiciosSection / NosotrosSection con FALLBACK_IMAGES a Colombia Hosting. (5) TestimoniosSection convertida a Client Component con reproductor de video (10 clips hardcodeados, controlsList="nodownload", onEnded auto-avanza). (6) CSP actualizado: img-src / media-src / connect-src incluyen `contenido.hacienda-encanto.com`; script-src incluye `static.cloudflareinsights.com`. (7) next.config.ts: `contenido.hacienda-encanto.com` en images.remotePatterns. |

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
- `initialize_service_order(p_booking_id)` — PL/pgSQL security definer, idempotente (borra y recrea), pre-llena 6 campos de Cabecera desde el booking. **Labels críticos**: `'Hora inicio'` y `'Hora fin'` (sin "de") — deben coincidir exactamente con `service_order_templates`. Migración `20260730000001` normaliza ambos (templates + función) ante posible desincronización histórica.
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
- Segmentación clientes: `getClientSegment(status, isActive)` — cumplidos > activos (pestaña "Cancelados" eliminada de la UI; los bookings cancelados siguen en BD). `ClientesTable` con prop `basePath: "planner" | "admin"`.
- `ClienteEditForm`: `Section`/`Field` definidos a nivel de módulo (nunca dentro del componente — React desmontaría los inputs en cada render perdiendo el foco).
- `hero_videos.event_type`: NULL = home, texto = página específica. Home filtra `.is("event_type", null)`.
- `EventosManager` no calcula KPIs propios — recibe `rows: BookingEventRow[]`; el caller calcula.
- `PlaylistReadOnly`: URLs como texto plano con botón Copiar (`navigator.clipboard`), no como hipervínculos.
- Playlist centinela: `section='centinela'`, `no_aplica=true/false`. Observaciones: `section='observaciones'`, texto en `song_url`.
- reCAPTCHA v3: se omite en dev si `RECAPTCHA_SECRET_KEY` no está configurada.
- Sin precios públicos — paquetes muestran nombre + contenido. CTA siempre "Cuéntanos tu evento" / "Conoce más".
- **TestimoniosSection** es Client Component (`"use client"`): siempre renderiza (no retorna null si no hay testimonios de texto). Reproductor de video con 10 clips hardcodeados en Colombia Hosting (`testimonios/1.mp4`–`10.mp4`), `controlsList="nodownload"`, sin autoplay, `onEnded` auto-avanza (wraparound al llegar al 10). Dots clickeables + contador X/10. Cards de texto debajo cuando Supabase devuelve datos.
- **Patrón Colombia Hosting fallback**: componentes con imágenes críticas definen `FALLBACK_IMG` / `FALLBACK_IMAGES` a nivel de módulo con URLs `https://contenido.hacienda-encanto.com/...`. Se aplica en EventosSection, ServiciosSection, NosotrosSection. Videos hero hardcodeados en page.tsx y EventPageTemplate (sin query a hero_videos). Queries Supabase en page.tsx / EventPageTemplate envueltas en try/catch con variables tipadas inicializadas antes del bloque.
- **SliderGaleria**: `object-cover object-center` en la imagen.

**Flujo de contacto WhatsApp**
- Campo `whatsapp` requerido en `contact_messages` (text not null default ''). Validación Zod: `/^(\+?57)?3\d{9}$/` via `.refine()` (no `.regex()` — obsoleto en Zod v4).
- Round-robin: al llegar un contacto, se consultan `asesor_assignments` ordenado por `total_assignments ASC, last_assigned_at ASC NULLS FIRST`. Se filtra contra perfiles activos de roles `asesor_comercial` y `wedding_planner`. Se incrementa el contador del asesor seleccionado.
- CallMeBot (`src/lib/callmebot.ts`): `sendWhatsAppNotification(msg)` — fire & forget, nunca bloquea al usuario. Usa `CALLMEBOT_PHONE_CENTRAL + CALLMEBOT_API_KEY_CENTRAL` si ambas están configuradas; de lo contrario cae al número de prueba.
- `contact_status` enum: `unread | read | replied | en_proceso`. Display: Nuevo / Leído / Respondido / En Proceso.
- RLS `contact_messages`: `asesor_comercial` → solo `assigned_asesor_id = auth.uid()`. `wedding_planner` → todos. `admin | gerente` → todos (via `is_admin_or_gerente()` nueva helper). Políticas `staff select` y `staff update` eliminadas.
- Panel `/portal/asesor-comercial`: lista de contactos asignados (arriba) + EventosManager (abajo). `ContactosAsesorView` es client component con estado optimista para cambios de estado.
- `profiles.phone`: privado — solo seleccionado en `/admin/usuarios` (admin query). UsuariosManager CrearModal y EditarModal incluyen campo phone etiquetado "(privado)". La RLS ya impide que clientes y anónimos lean perfiles ajenos (select: `auth.uid() = id OR is_staff_or_admin()`).
- **Badge reCAPTCHA**: `.grecaptcha-badge { visibility: hidden !important; }` en `globals.css`. Legalmente permitido si el formulario muestra texto de atribución con links a `policies.google.com/privacy` y `policies.google.com/terms`. Ambos formularios (`ContactForm`, `HomeContactForm`) incluyen este texto.

**Módulo de contrato**
- `ContractItems` JSONB en `bookings.contract_items`. Al cargar, siempre mergear con DEFAULT_CONTRACT_ITEMS: `{ ...DEFAULT_CONTRACT_ITEMS, ...booking.contract_items }` para retrocompatibilidad cuando se agregan campos nuevos.
- `ContractFieldType`: `"sino-fixed-1"` (boolean, muestra "1" fijo en PDF), `"sino"` (boolean, muestra "Sí" o "(ILIMITADO)" para gaseosa_agua/coctel), `"cantidad"` (string numérico, se oculta si ≤ 0), `"texto"` (string libre, se oculta si vacío). `VARIABLE_ITEM_TYPES` y `VARIABLE_ITEM_ORDER` en `lib/contract-items.ts`.
- Ítems nuevos en `DEFAULT_CONTRACT_ITEMS`: `pirotecnia` (sino) y `polvora_fria` (sino + cantidad). DJ/Maestro/Sonido/Luces son campos numéricos (cantidad de personas/equipos, no booleano). Auto-fill: al cargar `ContractItemsForm`, si `guest_count` está definido, `canelazo`, `champana`, `mobiliario`, `menaje` se inicializan a ese valor si aún son 0.
- `bookings.valor_segundo_abono` y `bookings.valor_tercer_abono` (numeric, nullable) — migración `20260731000002`. Visibles en `ClienteEditForm` bajo las fechas correspondientes. `generarContratoPDF` los incluye; `ContractPDFData` los expone como `valorSegundoAbono: number | null` y `valorTercerAbono: number | null`. Template vars: `{{valor_segundo_abono}}` y `{{valor_tercer_abono}}` formatean con `fmtMoney()` (muestra "—" si null).
- **`ContratoPDF` — una sola `<Page>`**: nunca usar dos `<Page>` en el Document — generaba página en blanco. El contenido fluye automáticamente entre páginas. Header y footer con `fixed` repiten en cada página.
- **PDF generado server-side**: `renderToBuffer` en SA → upload directo a Supabase Storage con `admin.storage.upload()`. No usa signed URL porque el archivo se crea en el servidor, no en el cliente.
- `sanitizeName` en `generar-contrato.ts`: usa `normalize("NFD").replace(/[̀-ͯ]/g, "")` con escape Unicode explícito — caracteres literales en el rango pueden corromperse según encoding del archivo.
- Datos editables hacienda: 8 claves `hacienda_*` en `site_content` (nombre, representante, cc_representante, nit, dirección, whatsapp, email, cuenta_davivienda). `resolveHaciendaData(contentMap)` combina site_content con `HACIENDA_INFO` como fallback.
- Cláusulas: **20 claves** `contrato_clausula_1..20` en `site_content`. `CLAUSULA_KEYS` en `lib/contract-items.ts` cubre hasta la 20. `ContenidoManager` tiene botón '+' para agregar cláusulas hasta el máximo. **CRÍTICO**: testimonios y cláusulas tienen fetch y estado separados — nunca mezclar en el mismo `useState`. Firma: `firma_representante` (URL de imagen en Storage). Editables desde `/editor/contenido`.
- `contract_locked: boolean` en bookings — cuando el cliente aprueba, se fija a `true`. El planner no puede editar ítems mientras esté bloqueado.
- `aprobarContrato(bookingId)`: verifica ownership (cliente solo aprueba su propio booking) → lock → `initialize_service_order(booking_id)` → notifica planners/admins. En `contrato-aprobacion.ts`.
- `/portal/planner/clientes/[clientId]/contrato/page.tsx`: muestra prereqs (CC, dirección, teléfono, email, valor_total, valor_anticipo) antes de permitir generar. `ContractItemsForm` deshabilitado cuando `contract_locked=true`. **Igual en `/admin/clientes/[clientId]/contrato/page.tsx`**.
- Variables dinámicas en cláusulas: `renderTemplate(text, templateVars)` en `ContratoPDF.tsx` parsea `{{varName}}` y devuelve `ReactNode[]` mezclando strings y `<Text>` en bold. `templateVars` tiene `fecha_evento`, `hora_inicio`, `hora_fin`, `tipo_evento`, `num_invitados`, `cliente_direccion`, `cliente_telefono`, `cliente_email`, `valor_segundo_abono`, `valor_tercer_abono`. **CRÍTICO**: cláusulas 3-20 deben renderizar `{renderTemplate(c.text, templateVars)}`, no `{c.text}` plano.
- `eliminarHistorialContratos(clientId, bookingId)` SA en `generar-contrato.ts`: verifica `contract_locked=false`, borra archivos de Storage y registros en BD de tipo "contrato", revalida paths. `ContratoPlanner.tsx` muestra botón solo cuando no está bloqueado.

**Seguridad HTTP**
- `next.config.ts` exporta `headers()` async con `source: "/(.*)"` aplicando headers a todas las rutas: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()`, `Content-Security-Policy`.
- CSP: `default-src 'self'`, `script-src 'self' 'unsafe-eval' 'unsafe-inline' google.com gstatic.com https://static.cloudflareinsights.com`, `img-src 'self' data: blob: SUPABASE_HOST https://contenido.hacienda-encanto.com`, `font-src 'self' data:` (fuentes self-hosteadas via next/font), `media-src 'self' blob: SUPABASE_HOST https://contenido.hacienda-encanto.com`, `connect-src 'self' SUPABASE_HOST wss://SUPABASE_HOST google.com googleapis.com https://contenido.hacienda-encanto.com`, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`. `'unsafe-inline'` y `'unsafe-eval'` requeridos por Next.js App Router. `static.cloudflareinsights.com` necesario para el script de analytics de Cloudflare.
- `frame-src https://www.google.com https://maps.google.com` — el mapa de Google en ContactoSection/EventContacto usa `maps.google.com` (distinto de `www.google.com`); sin este dominio el iframe muestra "Este contenido está bloqueado".
- Rate limiting login: tabla `login_attempts` (PostgreSQL + RLS `USING (false)` — solo service_role puede escribir). Ventana 15 min, máx 5 fallos, delay progresivo `Math.min(2^(failures-1), 16) * 1000ms`. Limpia intentos expirados en background tras cada fallo.
- `requestPasswordReset` validado con `resetPasswordSchema` Zod (`.string().email()`).

**Restricción de visibilidad por rol**
- `UPCOMING_EVENT_WINDOW_DAYS = 15` en `src/lib/event-window.ts` (único lugar que calcula la ventana).
- Admin y gerente: sin restricción de fecha. Resto (planner, staff, asesores): solo próximos 15 días (`options.restrictToUpcoming`).

**Recuperación de contraseña — flujo token_hash (crítico)**
- `resetPasswordForEmail(email, { redirectTo: "https://www.hacienda-encanto.com/update-password" })` — el template de Supabase envía el link con `?token_hash=XXXX&type=recovery`.
- `/update-password` lee `token_hash` y `type` de `window.location.search` y llama `supabase.auth.verifyOtp({ token_hash, type: "recovery" })` con el browser client. Si `type !== "recovery"` o no hay `token_hash`, asume sesión ya establecida y muestra el form directo.
- `/update-password` es standalone (fuera del grupo `(auth)`) para que Next.js lo sirva en la URL exacta que espera Supabase.
- Estados de la página: `loading` (verificando OTP) → `expired` (falló, muestra botón "Solicitar nuevo enlace") → `ready` (muestra form).
- Al éxito: `window.history.replaceState({}, "", "/update-password")` limpia `?token_hash=...&type=recovery` de la URL.
- `updatePassword` SA llama `supabase.auth.updateUser({ password })` con el server client (que lee la sesión de las cookies que el browser client grabó) y luego `redirect()` por rol.
- `src/app/auth/confirm/route.ts` existe pero **no se usa para password reset** — solo es auxiliar para otros flujos futuros.
- En Supabase Dashboard → Authentication → Email Templates → Reset Password: el link debe usar `{{ .ConfirmationURL }}` (genera `?token_hash=...&type=recovery`). En URL Configuration → Redirect URLs: `https://www.hacienda-encanto.com/update-password` y `http://localhost:3000/update-password`.
- Admin cambia contraseña: `cambiarPassword` SA en `admin/usuarios.ts` usa `createAdminClient().auth.admin.updateUserById(userId, { password })`. Componente `CambiarPasswordButton` reutilizable (usado en `/admin/usuarios` y `/admin/clientes/[clientId]`).

### Producción

El sitio está live en **https://www.hacienda-encanto.com**. Dominio conectado a Vercel. Todos los módulos de código completados. Último estado: 2026-08-04.

**⚠ Supabase bloqueado hasta el 20 ago 2026** (quota excedida). El sitio público funciona con fallbacks hardcodeados a Colombia Hosting (`contenido.hacienda-encanto.com`). El portal y admin no están disponibles para usuarios reales durante este período. Cuando se restaure la quota: reactivar queries en page.tsx, EventPageTemplate y contact.ts (los bloques try/catch ya están listos — simplemente la excepción dejará de lanzarse).

### Pendiente (no depende de código)

Todo el código está completo y en producción. Los ítems restantes son operativos o de contenido:

1. **Restaurar Supabase tras renovación de quota (20 ago 2026)** — cuando Supabase vuelva a estar disponible: las queries en `page.tsx`, `EventPageTemplate.tsx` y `contact.ts` ya están en try/catch y volverán a funcionar automáticamente. Los videos hero y las imágenes de galería/sitio seguirán usando Colombia Hosting hasta que el editor los actualice desde la UI — eso es deseable para no depender solo de Supabase.
2. **Videos y fotos empresarial / revelación** — pendientes del cliente. Subir desde `/editor/videos` y `/editor/galeria` cuando los entreguen.
3. **Tour virtual 360°** — grabar con Insta360 o alternativa en la hacienda y procesar en Kuula Pro (u otra plataforma). `Vista360.tsx` ya oculta la sección cuando no hay URL. Solo cargar la URL real en `site_content` clave `tour_360_url` desde `/editor/contenido` cuando esté lista.
4. **Registrar asesores en CallMeBot** — cuando Jonny Delgado y David Castillo estén disponibles: desde su WhatsApp enviar `I allow callmebot.com to send me messages` al `+1 (347) 798-2047`, obtener API key, configurar `CALLMEBOT_API_KEY_CENTRAL` en Vercel → Environment Variables.
5. **Verificar Supabase Dashboard** — 4 puntos: (a) Rate Limits configurados adecuadamente, (b) JWT expiry en 3600s, (c) bucket `documents` privado (no public), (d) RLS habilitado en todas las tablas (revisar especialmente `login_attempts`). **Adicionalmente**: aplicar migración `20260730000001` con `supabase db push` si aún no se ha hecho.
6. **Pruebas completas con usuarios reales** — Jonny Delgado (planner) y David Castillo (asesor comercial) deben recorrer el flujo completo: crear cliente → generar contrato → cliente aprueba → orden de servicio → documentos → pagos.

### Archivos clave

```
src/
  app/
    page.tsx                          ← Home público (Server Component, fetch paralelo)
    bodas|quince-anos|eventos-empresariales|revelacion-de-genero/page.tsx  ← EventPageConfig + EventPageTemplate
    sitemap.ts                        ← sitemap dinámico App Router (5 URLs públicas)
    robots.ts                         ← robots dinámico App Router
    auth/confirm/route.ts             ← Route Handler auxiliar (no se usa para password reset)
    update-password/page.tsx          ← standalone (fuera de (auth)); verifyOtp({ token_hash, type:"recovery" }) browser-side + form nueva contraseña
    actions/
      auth.ts                         ← login (redirect por rol), logout, cierre por inactividad, requestPasswordReset, updatePassword
      contact.ts                      ← submitContactForm (Zod + reCAPTCHA + whatsapp requerido + round-robin asesores + CallMeBot)
      contactos-asesor.ts             ← updateContactStatus (asesor actualiza estado de sus contactos)
      crear-cliente.ts                ← createClientAction: Auth+profile+booking con rollback y overlap check (SIN inicializar orden de servicio)
      contrato-aprobacion.ts          ← aprobarContrato (lock + initialize_service_order + notifica), solicitarAjustesContrato
      contrato-items.ts               ← saveContractItems (guarda JSONB en bookings.contract_items)
      orden-servicio.ts               ← savePlannerItems, approveServiceOrder, initServiceOrder
      actividades.ts                  ← createActivity/updateActivity (devuelven ActividadRow), deleteActivity
      invitados.ts                    ← requestGuestListUpload/confirmGuestListUpload, deleteGuestList, getGuestListDownloadUrl
      salon-maps.ts                   ← requestSalonMapUpload/confirmSalonMapUpload (devuelve SalonMapRow), toggleSalonMapActivo, deleteSalonMap
      pagos.ts                        ← registrarPago (devuelve PagoRow), confirmarPago, requestComprobanteUpload/confirmComprobanteUpload
      documentos.ts                   ← requestDocumentoUpload/confirmDocumentoUpload (devuelve {id,created_at}), deleteDocumento, listDocumentosConTamano
      playlist.ts                     ← savePlaylist (upsert onConflict booking_id,section; notifica admin/planner)
      admin/usuarios.ts               ← crearUsuario, editarUsuario, toggleUsuarioActivo, cambiarPassword (roles equipo, nunca "client")
      admin/generar-contrato.ts       ← generarContratoPDF: renderToBuffer + upload Storage server-side, nombre {Tipo} {DD-MM-YYYY} {Nombre}. eliminarHistorialContratos: borra docs Storage + BD (solo contract_locked=false)
      editor/galeria.ts               ← requestGaleriaUpload/confirmGaleriaUpload, updateGaleriaImage, reorderGaleriaImages
      editor/videos.ts                ← requestVideoUpload/confirmVideoUpload, activateVideo, deactivateVideo, deleteVideo
      editor/imagenes-sitio.ts        ← requestSiteImageUpload/confirmSiteImageUpload (upsert site_content), deleteSiteImage
      editor/testimonios.ts|paquetes.ts|contenido.ts
    (auth)/login/page.tsx             ← Login con identidad de marca. Link "¿Olvidaste tu contraseña?" → /reset-password
    (auth)/reset-password/page.tsx    ← Formulario email para resetPasswordForEmail
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
      planner/clientes/page.tsx       ← ClientesTable (tabs Activos/Cumplidos), restrictToUpcoming:false siempre
      planner/clientes/[clientId]/layout.tsx (o page con tabs) ← tabs: Contrato/Actividades/Invitados/Documentos/Pagos/Playlist
      planner/clientes/[clientId]/contrato/page.tsx            ← prereqs + ContractItemsForm + ContratoPlanner (generar/listar PDFs)
      planner/clientes/[clientId]/actividades|invitados|documentos|pagos|playlist/page.tsx
      planner/salon-mapas/page.tsx
      asesor-comercial/page.tsx       ← ContactosAsesorView (contactos asignados) + EventosManager 15 días
      asesor-logistica/page.tsx       ← EventosManager 15 días
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
    asesor/ContactosAsesorView.tsx    ← lista contactos asignados + panel de detalle por lead, cambio estado optimista, botón wa.me completo
    admin/UsuariosManager.tsx|EventosManager.tsx|KpiCard.tsx|CambiarPasswordButton.tsx  ← botón+modal reutilizable para cambio de contraseña por admin
    contrato/ContratoPDF.tsx          ← PDF react-pdf: Document+Page única, header/footer fixed, tabla 4 cols, cláusulas texto corrido
    portal/planner/ContractItemsForm.tsx  ← toggles Sí/No + cantidades + texto libre; deshabilitado cuando contract_locked
    portal/planner/ContratoPlanner.tsx    ← prereqs checklist + botón generar + lista PDFs generados
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
    callmebot.ts                      ← sendWhatsAppNotification (fire & forget; número central si CALLMEBOT_API_KEY_CENTRAL está configurada)
    contract-items.ts                 ← ContractItems interface, DEFAULT_CONTRACT_ITEMS, VARIABLE_ITEM_LABELS/TYPES/ORDER, HACIENDA_INFO, resolveHaciendaData, CLAUSULA_KEYS, FIRMA_KEY
  proxy.ts                            ← Middleware Next.js 16 (función exportada como "proxy")
  types/database.ts                   ← Tipos generados Supabase (regenerar tras cada migración)
next.config.ts                        ← HTTP security headers (CSP, X-Frame-Options, etc.) vía async headers()
public/
  logo-principal-fondo-claro.svg
  trebol-original.svg                 ← Favicon
  placeholder-avatar.svg
  placeholder-evento.svg              ← Placeholder de marca local (nunca dependencias externas)
supabase/migrations/
  (última aplicada: 20260730000001_fix_cabecera_prefill.sql — ver git log para historial completo)
```
