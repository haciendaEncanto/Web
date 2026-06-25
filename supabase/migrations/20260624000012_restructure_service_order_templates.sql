-- ============================================================
-- Hacienda El Encanto — Reestructura plantillas de orden de servicio
-- Dos actores: planner (cabecera, bebidas) + cliente (música/boda)
-- Secciones universales: event_type = 'all'
-- Secciones específicas: event_type = 'boda' | 'quince' | etc.
-- item_type soporta: text | textarea | time | date | number |
--                    boolean | select | url
-- ============================================================

-- ╔══════════════════════════════════════════════════════════╗
-- ║  1. Columna filled_by en templates e ítems               ║
-- ╚══════════════════════════════════════════════════════════╝

alter table public.service_order_templates
  add column if not exists filled_by text not null default 'planner'
  check (filled_by in ('planner', 'client'));

alter table public.service_order_items
  add column if not exists filled_by text not null default 'planner'
  check (filled_by in ('planner', 'client'));

-- ╔══════════════════════════════════════════════════════════╗
-- ║  2. RLS: cliente puede actualizar sus ítems filled_by    ║
-- ╚══════════════════════════════════════════════════════════╝

drop policy if exists "soi: client update filled_by client" on public.service_order_items;

create policy "soi: client update filled_by client"
  on public.service_order_items for update
  using (
    filled_by = 'client'
    and exists (
      select 1 from public.service_order_sections s
      join public.bookings b on b.id = s.booking_id
      where s.id = section_id and b.client_id = auth.uid()
    )
  )
  with check (
    filled_by = 'client'
    and exists (
      select 1 from public.service_order_sections s
      join public.bookings b on b.id = s.booking_id
      where s.id = section_id and b.client_id = auth.uid()
    )
  );

-- ╔══════════════════════════════════════════════════════════╗
-- ║  3. Limpiar templates y secciones previas                ║
-- ║  (service_order_items se borra en CASCADE por section)   ║
-- ╚══════════════════════════════════════════════════════════╝

delete from public.service_order_sections;
delete from public.service_order_templates;

-- ╔══════════════════════════════════════════════════════════╗
-- ║  4. PLANTILLAS UNIVERSALES (event_type = 'all')          ║
-- ║  Aplican a todos los tipos de evento.                    ║
-- ║  Las llena el Wedding Planner.                           ║
-- ╚══════════════════════════════════════════════════════════╝

insert into public.service_order_templates
  (event_type, section_name, section_sort, item_label, item_type, options, item_sort, filled_by)
values
  -- ── Sección 1: Cabecera ─────────────────────────────────
  ('all', 'Cabecera', 1, 'Fecha del evento',    'date',   '[]', 1, 'planner'),
  ('all', 'Cabecera', 1, 'Hora de inicio',       'time',   '[]', 2, 'planner'),
  ('all', 'Cabecera', 1, 'Hora de fin',          'time',   '[]', 3, 'planner'),
  ('all', 'Cabecera', 1, 'Cliente(s)',           'text',   '[]', 4, 'planner'),
  ('all', 'Cabecera', 1, 'Tipo de evento',       'select', '["Boda","Quinceañera","Empresarial","Revelación de Género"]', 5, 'planner'),
  ('all', 'Cabecera', 1, 'Cantidad de invitados','number', '[]', 6, 'planner'),

  -- ── Sección 2: Bebidas ──────────────────────────────────
  ('all', 'Bebidas', 2, 'Cocteles',          'select', '["Sí","No"]', 1, 'planner'),
  ('all', 'Bebidas', 2, 'Gaseosa',           'select', '["Sí","No"]', 2, 'planner'),
  ('all', 'Bebidas', 2, 'Licores - Tipo',    'text',   '[]',          3, 'planner'),
  ('all', 'Bebidas', 2, 'Licores - Cantidad','text',   '[]',          4, 'planner');

-- ╔══════════════════════════════════════════════════════════╗
-- ║  5. PLANTILLA ESPECÍFICA: boda                           ║
-- ║  Sección de música — la llena el CLIENTE.                ║
-- ╚══════════════════════════════════════════════════════════╝

insert into public.service_order_templates
  (event_type, section_name, section_sort, item_label, item_type, options, item_sort, filled_by)
values
  -- ── Sección 3: Música y playlist ────────────────────────
  -- Campo centinela: si está en Sí, el resto de música se oculta
  ('boda', 'Música y playlist', 3, 'Llevo acompañamiento musical propio', 'boolean', '[]',  1, 'client'),
  ('boda', 'Música y playlist', 3, 'Canción entrada novio',               'url',     '[]',  2, 'client'),
  ('boda', 'Música y playlist', 3, 'Canción entrada novia',               'url',     '[]',  3, 'client'),
  ('boda', 'Música y playlist', 3, 'Canción salida recién casados',       'url',     '[]',  4, 'client'),
  ('boda', 'Música y playlist', 3, 'Canción entrada salón',               'url',     '[]',  5, 'client'),
  ('boda', 'Música y playlist', 3, 'Vals recién casados',                 'url',     '[]',  6, 'client'),
  ('boda', 'Música y playlist', 3, 'Vals opción 2',                       'url',     '[]',  7, 'client'),
  ('boda', 'Música y playlist', 3, 'Vals opción 3',                       'url',     '[]',  8, 'client'),
  ('boda', 'Música y playlist', 3, 'Playlist ceremonia',                  'url',     '[]',  9, 'client'),
  ('boda', 'Música y playlist', 3, 'Playlist cena',                       'url',     '[]', 10, 'client'),
  ('boda', 'Música y playlist', 3, 'Playlist rumba',                      'url',     '[]', 11, 'client'),
  ('boda', 'Música y playlist', 3, 'Observaciones del cliente',           'textarea','[]', 12, 'client');

-- ╔══════════════════════════════════════════════════════════╗
-- ║  6. Actualizar initialize_service_order                  ║
-- ║  Carga secciones 'all' + secciones del event_type.       ║
-- ║  Copia filled_by desde la plantilla al ítem.             ║
-- ╚══════════════════════════════════════════════════════════╝

create or replace function public.initialize_service_order(p_booking_id uuid)
returns void language plpgsql security definer
set search_path = public as $$
declare
  v_event_type      text;
  v_section_id      uuid;
  v_current_section text := null;
  tmpl              record;
begin
  if not public.is_planner_or_admin() then
    raise exception 'Solo wedding planner o admin pueden inicializar la orden de servicio';
  end if;

  select event_type into v_event_type
  from public.bookings where id = p_booking_id;

  if not found then
    raise exception 'Booking no encontrado: %', p_booking_id;
  end if;

  -- Borrar secciones existentes (idempotente — CASCADE borra los ítems)
  delete from public.service_order_sections where booking_id = p_booking_id;

  -- Cargar plantillas universales ('all') + específicas del tipo de evento,
  -- ordenadas por section_sort y luego por item_sort.
  for tmpl in
    select *
    from public.service_order_templates
    where event_type in ('all', v_event_type)
    order by section_sort, item_sort
  loop
    if v_current_section is distinct from tmpl.section_name then
      insert into public.service_order_sections (booking_id, name, sort_order)
      values (p_booking_id, tmpl.section_name, tmpl.section_sort)
      returning id into v_section_id;

      v_current_section := tmpl.section_name;
    end if;

    insert into public.service_order_items
      (section_id, label, item_type, options, sort_order, filled_by)
    values
      (v_section_id, tmpl.item_label, tmpl.item_type, tmpl.options, tmpl.item_sort, tmpl.filled_by);
  end loop;
end;
$$;
