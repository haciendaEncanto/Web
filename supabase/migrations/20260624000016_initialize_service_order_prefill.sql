-- ============================================================
-- initialize_service_order: pre-llenar cabecera con datos del booking
-- Después de crear los ítems en blanco, actualiza los 6 campos
-- de la sección Cabecera con los valores ya conocidos del booking.
-- ============================================================

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
  -- Permitir service_role (auth.uid() NULL) o planner/admin
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

  -- Etiqueta legible del tipo de evento (coincide con las opciones del select)
  v_event_label := case v_event_type
    when 'boda'        then 'Boda'
    when 'quince'      then 'Quinceañera'
    when 'empresarial' then 'Empresarial'
    when 'revelacion'  then 'Revelación de Género'
    else v_event_type
  end;

  -- Borrar secciones existentes (CASCADE elimina ítems — idempotente)
  delete from public.service_order_sections where booking_id = p_booking_id;

  -- Crear secciones e ítems desde plantillas
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

  -- Pre-llenar sección Cabecera con valores del booking
  select id into v_cabecera_id
  from public.service_order_sections
  where booking_id = p_booking_id and name = 'Cabecera';

  if v_cabecera_id is not null then
    update public.service_order_items
      set value = v_event_date::text
      where section_id = v_cabecera_id and label = 'Fecha del evento';

    update public.service_order_items
      set value = to_char(v_start_time, 'HH24:MI')
      where section_id = v_cabecera_id and label = 'Hora de inicio';

    update public.service_order_items
      set value = to_char(v_end_time, 'HH24:MI')
      where section_id = v_cabecera_id and label = 'Hora de fin';

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
