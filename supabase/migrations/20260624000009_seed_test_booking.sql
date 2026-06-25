-- ============================================================
-- Hacienda El Encanto — Seed: reserva de prueba para cliente@test.com
-- Boda Natalia y Camilo — 16 dic 2026, 4:00 PM → 17 dic 01:45 AM
-- ============================================================

do $$
declare
  v_client_id  uuid;
  v_space_id   uuid;
  v_booking_id uuid;
begin
  -- Buscar client_id desde auth.users → profiles
  select p.id into v_client_id
  from public.profiles p
  join auth.users u on u.id = p.id
  where u.email = 'cliente@test.com'
  limit 1;

  if v_client_id is null then
    raise exception 'Usuario cliente@test.com no encontrado en profiles';
  end if;

  -- Salón Principal
  select id into v_space_id
  from public.spaces
  where slug = 'salon-principal'
  limit 1;

  if v_space_id is null then
    raise exception 'Espacio salon-principal no encontrado';
  end if;

  -- Evitar duplicados
  if exists (
    select 1 from public.bookings
    where client_id = v_client_id
      and event_date = '2026-12-16'
  ) then
    raise notice 'Reserva de prueba ya existe, omitiendo insert.';
    return;
  end if;

  -- Insertar reserva
  insert into public.bookings (
    client_id,
    space_id,
    event_type,
    event_date,
    event_start_time,
    event_end_time,
    guest_count,
    status,
    notes,
    total_amount
  ) values (
    v_client_id,
    v_space_id,
    'boda',
    '2026-12-16',
    '16:00:00',
    '01:45:00',
    100,
    'confirmed',
    'Evento de prueba — Boda Natalia y Camilo',
    0
  )
  returning id into v_booking_id;

  -- Insertar en calendar_events (timestamps en hora de Bogotá UTC-5)
  insert into public.calendar_events (
    booking_id,
    client_name,
    event_type,
    start_time,
    end_time,
    guest_count
  ) values (
    v_booking_id,
    'Natalia y Camilo',
    'boda',
    '2026-12-16 16:00:00-05'::timestamptz,
    '2026-12-17 01:45:00-05'::timestamptz,
    100
  );

  raise notice 'Reserva de prueba creada: %', v_booking_id;
end $$;
