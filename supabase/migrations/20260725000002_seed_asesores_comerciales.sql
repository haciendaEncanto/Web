-- ============================================================
-- Hacienda El Encanto — Seed: asesores comerciales
-- Jonny Delgado:  planner@hacienda-encanto.com / Planner2026!  (wedding_planner)
-- David Castillo: asesor@hacienda-encanto.com  / Asesor2026!   (asesor_comercial)
-- Teléfonos: privados, solo visibles para admin en /admin/usuarios
-- ============================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  v_jonny_id uuid;
  v_david_id uuid;
BEGIN

  -- ── Jonny Delgado (wedding_planner) ─────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'planner@hacienda-encanto.com') THEN
    v_jonny_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      aud, role, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_jonny_id,
      '00000000-0000-0000-0000-000000000000',
      'planner@hacienda-encanto.com',
      extensions.crypt('Planner2026!', extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Jonny Delgado"}'::jsonb,
      'authenticated', 'authenticated', '', '', '', ''
    );
  ELSE
    SELECT id INTO v_jonny_id FROM auth.users WHERE email = 'planner@hacienda-encanto.com';
  END IF;

  UPDATE public.profiles
  SET role = 'wedding_planner', full_name = 'Jonny Delgado', phone = '573213392181'
  WHERE id = v_jonny_id;

  -- Registrar en pool round-robin
  INSERT INTO public.asesor_assignments (asesor_id)
  VALUES (v_jonny_id)
  ON CONFLICT (asesor_id) DO NOTHING;

  RAISE NOTICE 'Jonny Delgado (wedding_planner) creado/actualizado: %', v_jonny_id;

  -- ── David Castillo (asesor_comercial) ───────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'asesor@hacienda-encanto.com') THEN
    v_david_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      aud, role, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_david_id,
      '00000000-0000-0000-0000-000000000000',
      'asesor@hacienda-encanto.com',
      extensions.crypt('Asesor2026!', extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"David Castillo"}'::jsonb,
      'authenticated', 'authenticated', '', '', '', ''
    );
  ELSE
    SELECT id INTO v_david_id FROM auth.users WHERE email = 'asesor@hacienda-encanto.com';
  END IF;

  UPDATE public.profiles
  SET role = 'asesor_comercial', full_name = 'David Castillo', phone = '573028331190'
  WHERE id = v_david_id;

  -- Registrar en pool round-robin
  INSERT INTO public.asesor_assignments (asesor_id)
  VALUES (v_david_id)
  ON CONFLICT (asesor_id) DO NOTHING;

  RAISE NOTICE 'David Castillo (asesor_comercial) creado/actualizado: %', v_david_id;

END $$;
