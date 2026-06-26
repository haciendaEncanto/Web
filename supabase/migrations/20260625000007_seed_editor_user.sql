-- ============================================================
-- Hacienda El Encanto — Seed: usuario editor de contenido
-- email: editor@haciendaencanto.com / Editor2026!
-- ============================================================
create extension if not exists pgcrypto with schema extensions;

do $$
declare
  v_user_id uuid;
begin
  if not exists (select 1 from auth.users where email = 'editor@haciendaencanto.com') then
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
      'editor@haciendaencanto.com',
      extensions.crypt('Editor2026!', extensions.gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Editor Hacienda"}'::jsonb,
      'authenticated',
      'authenticated',
      '', '', '', ''
    );
  else
    select id into v_user_id from auth.users where email = 'editor@haciendaencanto.com';
  end if;

  update public.profiles
  set
    role      = 'editor',
    full_name = 'Editor Hacienda'
  where id = v_user_id;

  raise notice 'Editor creado/actualizado: %', v_user_id;
end $$;
