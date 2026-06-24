-- ============================================================
-- Hacienda El Encanto — Orden de servicio detallada
-- Tablas: service_order_templates, service_order_sections,
--         service_order_items
-- La tabla service_orders existente (billing) se mantiene.
-- ============================================================

-- ╔══════════════════════════════════════════════════════════╗
-- ║  1. Columnas de aprobación en bookings                   ║
-- ╚══════════════════════════════════════════════════════════╝
-- El cliente aprueba la orden completa desde el portal.

alter table public.bookings
  add column if not exists service_order_approved    boolean,
  add column if not exists service_order_approved_at timestamptz,
  add column if not exists service_order_elaborated_by text;

-- ╔══════════════════════════════════════════════════════════╗
-- ║  2. TABLA: service_order_templates                       ║
-- ║  Plantillas sin FK a booking. Una fila por ítem.         ║
-- ╚══════════════════════════════════════════════════════════╝
-- item_type: text | textarea | time | boolean | select

create table if not exists public.service_order_templates (
  id           uuid        primary key default gen_random_uuid(),
  event_type   text        not null,
  section_name text        not null,
  section_sort int         not null default 0,
  item_label   text        not null,
  item_type    text        not null default 'text',
  options      jsonb       not null default '[]',
  item_sort    int         not null default 0,
  created_at   timestamptz not null default now()
);

alter table public.service_order_templates enable row level security;

create policy "sot: authenticated select"
  on public.service_order_templates for select
  using (auth.uid() is not null);

create policy "sot: admin insert"
  on public.service_order_templates for insert
  with check (public.is_admin());

create policy "sot: admin update"
  on public.service_order_templates for update
  using (public.is_admin());

create policy "sot: admin delete"
  on public.service_order_templates for delete
  using (public.is_admin());

create index on public.service_order_templates (event_type, section_sort, item_sort);

-- ╔══════════════════════════════════════════════════════════╗
-- ║  3. TABLA: service_order_sections                        ║
-- ║  Secciones de la orden de servicio de una reserva.       ║
-- ╚══════════════════════════════════════════════════════════╝

create table if not exists public.service_order_sections (
  id          uuid                 primary key default gen_random_uuid(),
  booking_id  uuid                 not null references public.bookings(id) on delete cascade,
  name        text                 not null,
  sort_order  int                  not null default 0,
  status      service_order_status not null default 'pending',
  notes       text,
  created_at  timestamptz          not null default now(),
  updated_at  timestamptz          not null default now()
);

alter table public.service_order_sections enable row level security;

-- SELECT: cliente (booking propio) + todo staff interno
create policy "sos: select"
  on public.service_order_sections for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
    or public.is_any_staff()
  );

-- INSERT/UPDATE: planner + admin
create policy "sos: planner insert"
  on public.service_order_sections for insert
  with check (public.is_planner_or_admin());

create policy "sos: planner update"
  on public.service_order_sections for update
  using (public.is_planner_or_admin())
  with check (public.is_planner_or_admin());

-- DELETE: admin
create policy "sos: admin delete"
  on public.service_order_sections for delete
  using (public.is_admin());

create trigger service_order_sections_updated_at
  before update on public.service_order_sections
  for each row execute function public.set_updated_at();

create index on public.service_order_sections (booking_id);

-- ╔══════════════════════════════════════════════════════════╗
-- ║  4. TABLA: service_order_items                           ║
-- ║  Ítems individuales dentro de cada sección.              ║
-- ╚══════════════════════════════════════════════════════════╝
-- value: texto libre que almacena el contenido (HH:MM, sí/no,
--        texto de menú, etc.) según item_type.

create table if not exists public.service_order_items (
  id          uuid        primary key default gen_random_uuid(),
  section_id  uuid        not null references public.service_order_sections(id) on delete cascade,
  label       text        not null,
  value       text,
  item_type   text        not null default 'text',
  options     jsonb       not null default '[]',
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.service_order_items enable row level security;

-- SELECT: cliente (booking propio via section) + todo staff interno
create policy "soi: select"
  on public.service_order_items for select
  using (
    exists (
      select 1 from public.service_order_sections s
      join public.bookings b on b.id = s.booking_id
      where s.id = section_id and b.client_id = auth.uid()
    )
    or public.is_any_staff()
  );

-- INSERT/UPDATE: planner + admin
create policy "soi: planner insert"
  on public.service_order_items for insert
  with check (public.is_planner_or_admin());

create policy "soi: planner update"
  on public.service_order_items for update
  using (public.is_planner_or_admin())
  with check (public.is_planner_or_admin());

-- DELETE: admin
create policy "soi: admin delete"
  on public.service_order_items for delete
  using (public.is_admin());

create trigger service_order_items_updated_at
  before update on public.service_order_items
  for each row execute function public.set_updated_at();

create index on public.service_order_items (section_id);

-- ╔══════════════════════════════════════════════════════════╗
-- ║  5. FUNCIÓN: initialize_service_order                    ║
-- ║  Crea secciones e ítems desde la plantilla del           ║
-- ║  event_type del booking. Solo planner/admin.             ║
-- ╚══════════════════════════════════════════════════════════╝

create or replace function public.initialize_service_order(p_booking_id uuid)
returns void language plpgsql security definer
set search_path = public as $$
declare
  v_event_type     text;
  v_section_id     uuid;
  v_current_section text := null;
  tmpl             record;
begin
  if not public.is_planner_or_admin() then
    raise exception 'Solo wedding planner o admin pueden inicializar la orden de servicio';
  end if;

  select event_type into v_event_type
  from public.bookings where id = p_booking_id;

  if not found then
    raise exception 'Booking no encontrado: %', p_booking_id;
  end if;

  -- Borrar secciones existentes (idempotente)
  delete from public.service_order_sections where booking_id = p_booking_id;

  for tmpl in
    select * from public.service_order_templates
    where event_type = v_event_type
    order by section_sort, item_sort
  loop
    if v_current_section is distinct from tmpl.section_name then
      insert into public.service_order_sections (booking_id, name, sort_order)
      values (p_booking_id, tmpl.section_name, tmpl.section_sort)
      returning id into v_section_id;

      v_current_section := tmpl.section_name;
    end if;

    insert into public.service_order_items
      (section_id, label, item_type, options, sort_order)
    values
      (v_section_id, tmpl.item_label, tmpl.item_type, tmpl.options, tmpl.item_sort);
  end loop;
end;
$$;

-- ╔══════════════════════════════════════════════════════════╗
-- ║  6. SEED: plantilla estándar boda                        ║
-- ╚══════════════════════════════════════════════════════════╝

insert into public.service_order_templates
  (event_type, section_name, section_sort, item_label, item_type, options, item_sort)
values
  -- ── Sección 1: Información general ─────────────────────
  ('boda', 'Información general', 1, 'Fecha y horario',      'text',    '[]', 1),
  ('boda', 'Información general', 1, 'Clientes',             'text',    '[]', 2),
  ('boda', 'Información general', 1, 'Tipo de evento',       'text',    '[]', 3),
  ('boda', 'Información general', 1, 'Cantidad de invitados','text',    '[]', 4),

  -- ── Sección 2: Menú y bebidas ───────────────────────────
  ('boda', 'Menú y bebidas', 2, 'Whisky',                   'select',  '["Sí","N/A"]', 1),
  ('boda', 'Menú y bebidas', 2, 'Menú',                     'textarea','[]', 2),
  ('boda', 'Menú y bebidas', 2, 'Ponque',                   'text',    '[]', 3),
  ('boda', 'Menú y bebidas', 2, 'Adicionales por la hacienda','textarea','[]', 4),

  -- ── Sección 3: Detalles del evento ──────────────────────
  ('boda', 'Detalles del evento', 3, 'Ramo',                 'text',    '[]', 1),
  ('boda', 'Detalles del evento', 3, 'Lista de invitados',   'text',    '[]', 2),
  ('boda', 'Detalles del evento', 3, 'Llegada de invitados - inicio', 'time', '[]', 3),
  ('boda', 'Detalles del evento', 3, 'Llegada de invitados - fin',    'time', '[]', 4),

  -- ── Sección 4: Ceremonia ────────────────────────────────
  ('boda', 'Ceremonia', 4, 'Tipo de ceremonia',  'select',  '["Cristiana","Civil","Simbólica"]', 1),
  ('boda', 'Ceremonia', 4, 'Contrato capilla',   'boolean', '[]', 2),
  ('boda', 'Ceremonia', 4, 'Inicio de ceremonia','time',    '[]', 3),
  ('boda', 'Ceremonia', 4, 'Lugar',              'text',    '[]', 4),
  ('boda', 'Ceremonia', 4, 'Final de ceremonia', 'time',    '[]', 5),
  ('boda', 'Ceremonia', 4, 'Felicitaciones y fotos invitados', 'time', '[]', 6),
  ('boda', 'Ceremonia', 4, 'Fotos novios solos', 'time',    '[]', 7),

  -- ── Sección 5: Protocolo ────────────────────────────────
  ('boda', 'Protocolo', 5, 'Hora de inicio',             'time',    '[]', 1),
  ('boda', 'Protocolo', 5, 'Canción de ingreso al salón','text',    '[]', 2),
  ('boda', 'Protocolo', 5, 'Palabras de bienvenida',     'text',    '[]', 3),
  ('boda', 'Protocolo', 5, 'Palabras de novios',         'text',    '[]', 4),
  ('boda', 'Protocolo', 5, 'Palabras de padres',         'boolean', '[]', 5),
  ('boda', 'Protocolo', 5, 'Brindis',                    'time',    '[]', 6),
  ('boda', 'Protocolo', 5, 'Vals',                       'time',    '[]', 7),
  ('boda', 'Protocolo', 5, 'Cámara de niebla en vals',   'boolean', '[]', 8),

  -- ── Sección 6: Programa ─────────────────────────────────
  ('boda', 'Programa', 6, 'Fotos mesa por mesa',        'time', '[]', 1),
  ('boda', 'Programa', 6, 'Salida del menú',            'time', '[]', 2),
  ('boda', 'Programa', 6, 'Postre',                     'time', '[]', 3),
  ('boda', 'Programa', 6, 'Esparcimiento',              'time', '[]', 4),
  ('boda', 'Programa', 6, 'Salida de cocteles',         'time', '[]', 5),
  ('boda', 'Programa', 6, 'Rifa del ramo',              'time', '[]', 6),
  ('boda', 'Programa', 6, 'Actividad de integración',   'text', '[]', 7),
  ('boda', 'Programa', 6, 'Hora loca',                  'time', '[]', 8),
  ('boda', 'Programa', 6, 'Fin del evento',             'time', '[]', 9),

  -- ── Sección 7: Observaciones ────────────────────────────
  ('boda', 'Observaciones', 7, 'Observaciones generales', 'textarea', '[]', 1);
