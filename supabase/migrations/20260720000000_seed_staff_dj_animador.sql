-- ============================================================
-- Hacienda El Encanto — Seed: usuarios de prueba staff (DJ y Animador)
-- dj@haciendaencanto.com / Staff2026!
-- animador@haciendaencanto.com / Staff2026!
-- ============================================================
create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_user_id uuid;
begin
  -- ── DJ ──────────────────────────────────────────────────────
  if not exists (select 1 from auth.users where email = 'dj@haciendaencanto.com') then
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
      'dj@haciendaencanto.com',
      extensions.crypt('Staff2026!', extensions.gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Staff DJ"}'::jsonb,
      'authenticated',
      'authenticated',
      '', '', '', ''
    );
  else
    select id into v_user_id from auth.users where email = 'dj@haciendaencanto.com';
  end if;

  update public.profiles
  set
    role      = 'staff',
    full_name = 'Staff DJ'
  where id = v_user_id;

  raise notice 'Staff DJ creado/actualizado: %', v_user_id;

  -- ── Animador ────────────────────────────────────────────────
  if not exists (select 1 from auth.users where email = 'animador@haciendaencanto.com') then
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
      'animador@haciendaencanto.com',
      extensions.crypt('Staff2026!', extensions.gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Staff Animador"}'::jsonb,
      'authenticated',
      'authenticated',
      '', '', '', ''
    );
  else
    select id into v_user_id from auth.users where email = 'animador@haciendaencanto.com';
  end if;

  update public.profiles
  set
    role      = 'staff',
    full_name = 'Staff Animador'
  where id = v_user_id;

  raise notice 'Staff Animador creado/actualizado: %', v_user_id;
end $$;
