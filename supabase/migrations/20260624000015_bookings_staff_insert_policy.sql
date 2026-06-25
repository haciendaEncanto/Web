-- ============================================================
-- 1. Política de INSERT en bookings para staff/admin
--    La política original solo permite client_id = auth.uid().
--    El planner crea reservas para otros clientes, así que
--    necesita su propia política.
-- ============================================================

create policy "bookings: staff insert"
  on public.bookings for insert
  with check (public.is_staff_or_admin());

-- ============================================================
-- 2. Actualizar initialize_service_order para aceptar llamadas
--    con service_role key (auth.uid() es NULL con service_role).
--    Esto permite usar el admin client en Server Actions.
-- ============================================================

create or replace function public.initialize_service_order(p_booking_id uuid)
returns void language plpgsql security definer
set search_path = public as $$
declare
  v_event_type      text;
  v_section_id      uuid;
  v_current_section text := null;
  tmpl              record;
begin
  -- Permitir service_role (auth.uid() = NULL) o planner/admin
  if auth.uid() is not null and not public.is_planner_or_admin() then
    raise exception 'Solo wedding planner o admin pueden inicializar la orden de servicio';
  end if;

  select event_type into v_event_type
  from public.bookings where id = p_booking_id;

  if not found then
    raise exception 'Booking no encontrado: %', p_booking_id;
  end if;

  -- Idempotente: borra secciones existentes (CASCADE elimina items)
  delete from public.service_order_sections where booking_id = p_booking_id;

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
