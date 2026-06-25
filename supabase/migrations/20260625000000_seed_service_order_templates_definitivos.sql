-- ============================================================
-- Hacienda El Encanto — Plantillas definitivas de orden de servicio
-- Estructura real del negocio. Reemplaza todos los seeds anteriores.
-- Cambios:
--   1. Columna notes en templates e items (para hints/aclaraciones)
--   2. RLS: bloquear edición cuando service_order_approved = true
--   3. Limpiar y reemplazar todas las plantillas
--   4. Sección Aprobación universal (filled_by = 'client')
--   5. Actualizar initialize_service_order: copia notes, labels nuevos
-- ============================================================

-- ╔══════════════════════════════════════════════════════════╗
-- ║  1. Columna notes                                        ║
-- ╚══════════════════════════════════════════════════════════╝

alter table public.service_order_templates
  add column if not exists notes text null;

alter table public.service_order_items
  add column if not exists notes text null;

-- ╔══════════════════════════════════════════════════════════╗
-- ║  2. RLS: bloquear edición cuando la orden está aprobada  ║
-- ╚══════════════════════════════════════════════════════════╝

-- Planner no puede editar ítems de una orden ya aprobada
drop policy if exists "soi: planner update" on public.service_order_items;
create policy "soi: planner update"
  on public.service_order_items for update
  using (
    public.is_planner_or_admin()
    and not exists (
      select 1
      from public.service_order_sections s
      join public.bookings b on b.id = s.booking_id
      where s.id = section_id
        and coalesce(b.service_order_approved, false) = true
    )
  )
  with check (public.is_planner_or_admin());

-- Cliente no puede editar ítems de una orden ya aprobada
drop policy if exists "soi: client update filled_by client" on public.service_order_items;
create policy "soi: client update filled_by client"
  on public.service_order_items for update
  using (
    filled_by = 'client'
    and not exists (
      select 1
      from public.service_order_sections s
      join public.bookings b on b.id = s.booking_id
      where s.id = section_id
        and coalesce(b.service_order_approved, false) = true
    )
    and exists (
      select 1
      from public.service_order_sections s
      join public.bookings b on b.id = s.booking_id
      where s.id = section_id and b.client_id = auth.uid()
    )
  )
  with check (
    filled_by = 'client'
    and exists (
      select 1
      from public.service_order_sections s
      join public.bookings b on b.id = s.booking_id
      where s.id = section_id and b.client_id = auth.uid()
    )
  );

-- ╔══════════════════════════════════════════════════════════╗
-- ║  3. Limpiar plantillas y secciones previas               ║
-- ║  (service_order_items se borra en CASCADE por section)   ║
-- ╚══════════════════════════════════════════════════════════╝

delete from public.service_order_sections;
delete from public.service_order_templates;

-- ╔══════════════════════════════════════════════════════════╗
-- ║  4. SECCIONES UNIVERSALES (event_type = 'all')           ║
-- ║  Aplican a todos los eventos. Las llena el planner.      ║
-- ╚══════════════════════════════════════════════════════════╝

insert into public.service_order_templates
  (event_type, section_name, section_sort, item_label, item_type, options, item_sort, filled_by, notes)
values
  -- ── Sección 1: Cabecera ─────────────────────────────────
  ('all', 'Cabecera', 1, 'Fecha del evento',     'date',   '[]', 1, 'planner', null),
  ('all', 'Cabecera', 1, 'Hora inicio',           'time',   '[]', 2, 'planner', null),
  ('all', 'Cabecera', 1, 'Hora fin',              'time',   '[]', 3, 'planner', null),
  ('all', 'Cabecera', 1, 'Cliente(s)',            'text',   '[]', 4, 'planner', null),
  ('all', 'Cabecera', 1, 'Tipo de evento',        'select', '["Boda","Quinceañera","Empresarial","Revelación de Género"]', 5, 'planner', null),
  ('all', 'Cabecera', 1, 'Cantidad de invitados', 'number', '[]', 6, 'planner', null),

  -- ── Sección 2: Menú y Bebidas ───────────────────────────
  ('all', 'Menú y Bebidas', 2, 'Menú',                        'textarea', '[]',          1, 'planner', null),
  ('all', 'Menú y Bebidas', 2, 'Ponque',                      'text',     '[]',          2, 'planner', null),
  ('all', 'Menú y Bebidas', 2, 'Ramo',                        'text',     '[]',          3, 'planner', 'Solo para bodas y quinceañeras'),
  ('all', 'Menú y Bebidas', 2, 'Cocteles',                    'select',   '["Sí","No"]', 4, 'planner', null),
  ('all', 'Menú y Bebidas', 2, 'Gaseosa',                     'select',   '["Sí","No"]', 5, 'planner', null),
  ('all', 'Menú y Bebidas', 2, 'Licores - Tipo',              'text',     '[]',          6, 'planner', null),
  ('all', 'Menú y Bebidas', 2, 'Licores - Cantidad',          'text',     '[]',          7, 'planner', null),
  ('all', 'Menú y Bebidas', 2, 'Adicionales por la hacienda', 'textarea', '[]',          8, 'planner', null),
  ('all', 'Menú y Bebidas', 2, 'Llegada de invitados',        'time',     '[]',          9, 'planner', null),

  -- ── Sección 99: Aprobación (siempre al final) ───────────
  -- filled_by = 'client': el cliente aprueba la orden completa
  ('all', 'Aprobación', 99, 'Aprobado por el cliente', 'boolean', '[]', 1, 'client', null);

-- ╔══════════════════════════════════════════════════════════╗
-- ║  5. BODA                                                 ║
-- ╚══════════════════════════════════════════════════════════╝

insert into public.service_order_templates
  (event_type, section_name, section_sort, item_label, item_type, options, item_sort, filled_by, notes)
values
  -- ── Sección 3: Ceremonia ────────────────────────────────
  ('boda', 'Ceremonia', 3, 'Contrato capilla',                          'select', '["Sí","No"]', 1,  'planner', null),
  ('boda', 'Ceremonia', 3, 'Inicio de ceremonia',                       'time',   '[]',          2,  'planner', null),
  ('boda', 'Ceremonia', 3, 'Final de ceremonia',                        'time',   '[]',          3,  'planner', null),
  ('boda', 'Ceremonia', 3, 'Felicitaciones y fotos invitados — inicio', 'time',   '[]',          4,  'planner', null),
  ('boda', 'Ceremonia', 3, 'Felicitaciones y fotos invitados — fin',    'time',   '[]',          5,  'planner', null),
  ('boda', 'Ceremonia', 3, 'Fotos novios solos — inicio',               'time',   '[]',          6,  'planner', null),
  ('boda', 'Ceremonia', 3, 'Fotos novios solos — fin',                  'time',   '[]',          7,  'planner', null),
  ('boda', 'Ceremonia', 3, 'Tienen pirotecnia',                         'select', '["Sí","No"]', 8,  'planner', null),

  -- ── Sección 4: Protocolo ────────────────────────────────
  ('boda', 'Protocolo', 4, 'Inicio protocolo',                           'time',   '[]',          1,  'planner', null),
  ('boda', 'Protocolo', 4, 'Canción ingreso al salón',                   'text',   '[]',          2,  'planner', null),
  ('boda', 'Protocolo', 4, 'Palabras de bienvenida — a cargo de',        'text',   '[]',          3,  'planner', null),
  ('boda', 'Protocolo', 4, 'Palabras novia',                             'select', '["Sí","No"]', 4,  'planner', null),
  ('boda', 'Protocolo', 4, 'Palabras novio',                             'select', '["Sí","No"]', 5,  'planner', null),
  ('boda', 'Protocolo', 4, 'Palabras de padres',                         'select', '["Sí","No"]', 6,  'planner', null),
  ('boda', 'Protocolo', 4, 'Brindis a cargo de la Hacienda',             'select', '["Sí","No"]', 7,  'planner', null),
  ('boda', 'Protocolo', 4, 'En caso No — nombre de quien da el brindis', 'text',   '[]',          8,  'planner', null),
  ('boda', 'Protocolo', 4, 'Canción vals',                               'text',   '[]',          9,  'planner', null),
  ('boda', 'Protocolo', 4, 'Vals opción 2',                              'text',   '[]',          10, 'planner', null),
  ('boda', 'Protocolo', 4, 'Vals opción 3',                              'text',   '[]',          11, 'planner', null),
  ('boda', 'Protocolo', 4, 'Actividades adicionales',                    'select', '["Sí","No"]', 12, 'planner', null),
  ('boda', 'Protocolo', 4, 'Tienen pista de audio',                      'select', '["Sí","No"]', 13, 'planner', null),
  ('boda', 'Protocolo', 4, 'Fotos mesa por mesa — inicio',               'time',   '[]',          14, 'planner', null),
  ('boda', 'Protocolo', 4, 'Fotos mesa por mesa — fin',                  'time',   '[]',          15, 'planner', null),
  ('boda', 'Protocolo', 4, 'Salida del menú',                            'time',   '[]',          16, 'planner', null),
  ('boda', 'Protocolo', 4, 'Postre',                                     'time',   '[]',          17, 'planner', null),
  ('boda', 'Protocolo', 4, 'Inicio rumba',                               'time',   '[]',          18, 'planner', null),
  ('boda', 'Protocolo', 4, 'Rifa del ramo',                              'time',   '[]',          19, 'planner', null),
  ('boda', 'Protocolo', 4, 'Hora loca',                                  'time',   '[]',          20, 'planner', null),
  ('boda', 'Protocolo', 4, 'Fin del evento',                             'time',   '[]',          21, 'planner', null),

  -- ── Sección 5: Observaciones ────────────────────────────
  ('boda', 'Observaciones', 5, 'Observaciones generales', 'textarea', '[]', 1, 'planner', null);

-- ╔══════════════════════════════════════════════════════════╗
-- ║  6. QUINCEAÑERA                                          ║
-- ╚══════════════════════════════════════════════════════════╝

insert into public.service_order_templates
  (event_type, section_name, section_sort, item_label, item_type, options, item_sort, filled_by, notes)
values
  -- ── Sección 3: Ceremonia ────────────────────────────────
  ('quince', 'Ceremonia', 3, 'Contrato capilla',                          'select', '["Sí","No"]', 1,  'planner', null),
  ('quince', 'Ceremonia', 3, 'Canción ingreso zona verde',                'text',   '[]',          2,  'planner', null),
  ('quince', 'Ceremonia', 3, 'Felicitaciones y fotos invitados',          'time',   '[]',          3,  'planner', null),
  ('quince', 'Ceremonia', 3, 'Tienen pirotecnia',                         'select', '["Sí","No"]', 4,  'planner', null),
  ('quince', 'Ceremonia', 3, 'Canción ingreso al salón',                  'text',   '[]',          5,  'planner', null),
  ('quince', 'Ceremonia', 3, 'Palabras de mamá',                          'select', '["Sí","No"]', 6,  'planner', null),
  ('quince', 'Ceremonia', 3, 'Nombre de la mamá',                         'text',   '[]',          7,  'planner', null),
  ('quince', 'Ceremonia', 3, 'Palabras de papá',                          'select', '["Sí","No"]', 8,  'planner', null),
  ('quince', 'Ceremonia', 3, 'Nombre del papá',                           'text',   '[]',          9,  'planner', null),
  ('quince', 'Ceremonia', 3, 'Palabras de la quinceañera',                'select', '["Sí","No"]', 10, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Palabras adicionales',                      'select', '["Sí","No"]', 11, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Quién las ofrece',                          'text',   '[]',          12, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Brindis a cargo de la Hacienda',            'select', '["Sí","No"]', 13, 'planner', null),
  ('quince', 'Ceremonia', 3, 'En caso No — nombre de quien da el brindis','text',   '[]',          14, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Canción vals',                              'text',   '[]',          15, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Vals opción 2',                             'text',   '[]',          16, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Vals opción 3',                             'text',   '[]',          17, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Actividades adicionales',                   'select', '["Sí","No"]', 18, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Tienen pista de audio',                     'select', '["Sí","No"]', 19, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Fotos mesa por mesa — inicio',              'time',   '[]',          20, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Fotos mesa por mesa — fin',                 'time',   '[]',          21, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Salida del menú',                           'time',   '[]',          22, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Postre',                                    'time',   '[]',          23, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Inicio rumba',                              'time',   '[]',          24, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Hora loca',                                 'time',   '[]',          25, 'planner', null),
  ('quince', 'Ceremonia', 3, 'Fin del evento',                            'time',   '[]',          26, 'planner', null),

  -- ── Sección 4: Observaciones ────────────────────────────
  ('quince', 'Observaciones', 4, 'Observaciones generales', 'textarea', '[]', 1, 'planner', null);

-- ╔══════════════════════════════════════════════════════════╗
-- ║  7. EMPRESARIAL                                          ║
-- ╚══════════════════════════════════════════════════════════╝

insert into public.service_order_templates
  (event_type, section_name, section_sort, item_label, item_type, options, item_sort, filled_by, notes)
values
  -- ── Sección 3: Programa ─────────────────────────────────
  ('empresarial', 'Programa', 3, 'Palabras de bienvenida — a cargo de', 'text',   '[]',          1, 'planner', null),
  ('empresarial', 'Programa', 3, 'Palabras adicionales',                 'select', '["Sí","No"]', 2, 'planner', null),
  ('empresarial', 'Programa', 3, 'Quién las ofrece',                     'text',   '[]',          3, 'planner', null),
  ('empresarial', 'Programa', 3, 'Actividades adicionales',              'select', '["Sí","No"]', 4, 'planner', null),
  ('empresarial', 'Programa', 3, 'Tienen pista de audio',                'select', '["Sí","No"]', 5, 'planner', null),
  ('empresarial', 'Programa', 3, 'Salida del menú',                      'time',   '[]',          6, 'planner', null),
  ('empresarial', 'Programa', 3, 'Postre',                               'time',   '[]',          7, 'planner', null),
  ('empresarial', 'Programa', 3, 'Fin del evento',                       'time',   '[]',          8, 'planner', null),

  -- ── Sección 4: Observaciones ────────────────────────────
  ('empresarial', 'Observaciones', 4, 'Observaciones generales', 'textarea', '[]', 1, 'planner', null);

-- ╔══════════════════════════════════════════════════════════╗
-- ║  8. REVELACIÓN DE GÉNERO                                 ║
-- ╚══════════════════════════════════════════════════════════╝

insert into public.service_order_templates
  (event_type, section_name, section_sort, item_label, item_type, options, item_sort, filled_by, notes)
values
  -- ── Sección 3: Programa ─────────────────────────────────
  ('revelacion', 'Programa', 3, 'Palabras de bienvenida — a cargo de', 'text',   '[]',          1, 'planner', null),
  ('revelacion', 'Programa', 3, 'Palabras adicionales',                 'select', '["Sí","No"]', 2, 'planner', null),
  ('revelacion', 'Programa', 3, 'Quién las ofrece',                     'text',   '[]',          3, 'planner', null),
  ('revelacion', 'Programa', 3, 'Actividades adicionales',              'select', '["Sí","No"]', 4, 'planner', null),
  ('revelacion', 'Programa', 3, 'Tienen pista de audio',                'select', '["Sí","No"]', 5, 'planner', null),
  ('revelacion', 'Programa', 3, 'Salida del menú',                      'time',   '[]',          6, 'planner', null),
  ('revelacion', 'Programa', 3, 'Postre',                               'time',   '[]',          7, 'planner', null),
  ('revelacion', 'Programa', 3, 'Fin del evento',                       'time',   '[]',          8, 'planner', null),

  -- ── Sección 4: Observaciones ────────────────────────────
  ('revelacion', 'Observaciones', 4, 'Observaciones generales', 'textarea', '[]', 1, 'planner', null);

-- ╔══════════════════════════════════════════════════════════╗
-- ║  9. Actualizar initialize_service_order                  ║
-- ║  · Copia notes desde la plantilla al ítem               ║
-- ║  · Labels de Cabecera actualizados: 'Hora inicio'/fin    ║
-- ║  · Acepta service_role (auth.uid() NULL)                 ║
-- ╚══════════════════════════════════════════════════════════╝

create or replace function public.initialize_service_order(p_booking_id uuid)
returns void language plpgsql security definer
set search_path = public as $$
declare
  v_event_type      text;
  v_event_date      date;
  v_start_time      time;
  v_end_time        time;
  v_guest_count     int;
  v_client_name     text;
  v_event_label     text;
  v_section_id      uuid;
  v_cabecera_id     uuid;
  v_current_section text := null;
  tmpl              record;
begin
  -- Permite service_role (auth.uid() NULL) o planner/admin autenticado
  if auth.uid() is not null and not public.is_planner_or_admin() then
    raise exception 'Solo wedding planner o admin pueden inicializar la orden de servicio';
  end if;

  -- Obtener datos del booking + nombre completo del cliente
  select
    b.event_type,
    b.event_date,
    b.event_start_time,
    b.event_end_time,
    b.guest_count,
    p.full_name
  into
    v_event_type, v_event_date, v_start_time, v_end_time, v_guest_count, v_client_name
  from public.bookings b
  join public.profiles p on p.id = b.client_id
  where b.id = p_booking_id;

  if not found then
    raise exception 'Booking no encontrado: %', p_booking_id;
  end if;

  -- Etiqueta legible del tipo de evento (coincide con el select de Cabecera)
  v_event_label := case v_event_type
    when 'boda'        then 'Boda'
    when 'quince'      then 'Quinceañera'
    when 'empresarial' then 'Empresarial'
    when 'revelacion'  then 'Revelación de Género'
    else v_event_type
  end;

  -- Borrar secciones existentes — CASCADE elimina ítems (idempotente)
  delete from public.service_order_sections where booking_id = p_booking_id;

  -- Crear secciones e ítems desde plantillas:
  -- event_type 'all' (universales) + event_type específico del booking,
  -- ordenados por section_sort y luego item_sort.
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
      (section_id, label, item_type, options, sort_order, filled_by, notes)
    values
      (v_section_id, tmpl.item_label, tmpl.item_type, tmpl.options,
       tmpl.item_sort, tmpl.filled_by, tmpl.notes);
  end loop;

  -- Pre-llenar sección Cabecera con datos del booking
  select id into v_cabecera_id
  from public.service_order_sections
  where booking_id = p_booking_id and name = 'Cabecera';

  if v_cabecera_id is not null then
    update public.service_order_items
      set value = v_event_date::text
      where section_id = v_cabecera_id and label = 'Fecha del evento';

    update public.service_order_items
      set value = to_char(v_start_time, 'HH24:MI')
      where section_id = v_cabecera_id and label = 'Hora inicio';

    update public.service_order_items
      set value = to_char(v_end_time, 'HH24:MI')
      where section_id = v_cabecera_id and label = 'Hora fin';

    update public.service_order_items
      set value = coalesce(v_client_name, '')
      where section_id = v_cabecera_id and label = 'Cliente(s)';

    update public.service_order_items
      set value = v_event_label
      where section_id = v_cabecera_id and label = 'Tipo de evento';

    update public.service_order_items
      set value = v_guest_count::text
      where section_id = v_cabecera_id and label = 'Cantidad de invitados';
  end if;
end;
$$;
