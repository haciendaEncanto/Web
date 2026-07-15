-- ============================================================
-- Hacienda El Encanto — Reseed: cliente@test.com / Test1234!
-- El usuario y su reserva de prueba (migraciones 20260624000007 y
-- 20260624000009) se perdieron en algún momento después de aplicarse
-- (auth.users no tiene el registro, aunque la migración figura como
-- aplicada). Se recrea todo el fixture: auth user → booking →
-- calendar_event → orden de servicio inicializada.
-- ============================================================
create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_client_id  uuid;
  v_space_id   uuid;
  v_booking_id uuid;
begin
  -- 1) Usuario en auth.users (el trigger handle_new_user crea el profile)
  if not exists (select 1 from auth.users where email = 'cliente@test.com') then
    v_client_id := gen_random_uuid();

    insert into auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) values (
      v_client_id,
      '00000000-0000-0000-0000-000000000000',
      'cliente@test.com',
      extensions.crypt('Test1234!', extensions.gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Cliente Test"}'::jsonb,
      'authenticated',
      'authenticated',
      '', '', '', ''
    );
  else
    select id into v_client_id from auth.users where email = 'cliente@test.com';
  end if;

  update public.profiles
  set full_name = 'Cliente Test'
  where id = v_client_id;

  -- 2) Reserva de prueba — Boda Natalia y Camilo
  select id into v_space_id from public.spaces where slug = 'salon-principal' limit 1;
  if v_space_id is null then
    raise exception 'Espacio salon-principal no encontrado';
  end if;

  select id into v_booking_id
  from public.bookings
  where client_id = v_client_id and event_date = '2026-12-16';

  if v_booking_id is null then
    insert into public.bookings (
      client_id, space_id, event_type, event_date,
      event_start_time, event_end_time, guest_count,
      status, notes, total_amount
    ) values (
      v_client_id, v_space_id, 'boda', '2026-12-16',
      '16:00:00', '01:45:00', 100,
      'confirmed', 'Evento de prueba — Boda Natalia y Camilo', 0
    )
    returning id into v_booking_id;

    insert into public.calendar_events (
      booking_id, client_name, event_type, start_time, end_time, guest_count
    ) values (
      v_booking_id, 'Natalia y Camilo', 'boda',
      '2026-12-16 16:00:00-05'::timestamptz,
      '2026-12-17 01:45:00-05'::timestamptz,
      100
    );

    raise notice 'Reserva de prueba creada: %', v_booking_id;
  end if;

  -- 3) Orden de servicio inicializada (idempotente, ver función)
  perform public.initialize_service_order(v_booking_id);

  raise notice 'Cliente de prueba listo: % (booking %)', v_client_id, v_booking_id;
end $$;
