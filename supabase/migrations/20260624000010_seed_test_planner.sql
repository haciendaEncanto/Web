-- ============================================================
-- Hacienda El Encanto — Seed: usuario wedding planner de prueba
-- email: planner@haciendaencanto.com / Planner2026!
-- ============================================================
create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_user_id uuid;
begin
  -- Insertar en auth.users solo si no existe
  if not exists (select 1 from auth.users where email = 'planner@haciendaencanto.com') then
    v_user_id := gen_random_uuid();

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
      v_user_id,
      '00000000-0000-0000-0000-000000000000',
      'planner@haciendaencanto.com',
      extensions.crypt('Planner2026!', extensions.gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Jonny Delgado"}'::jsonb,
      'authenticated',
      'authenticated',
      '', '', '', ''
    );
  else
    select id into v_user_id from auth.users where email = 'planner@haciendaencanto.com';
  end if;

  -- El trigger handle_new_user crea el profile con role='client' por defecto.
  -- Actualizamos a wedding_planner y nombre completo.
  update public.profiles
  set
    role      = 'wedding_planner',
    full_name = 'Jonny Delgado'
  where id = v_user_id;

  raise notice 'Wedding planner creado/actualizado: %', v_user_id;
end $$;
