-- ============================================================
-- Hacienda El Encanto — Migrar usuarios al dominio hacienda-encanto.com
-- 1. Eliminar usuarios del dominio viejo @haciendaencanto.com (sin guión)
-- 2. Crear admin@hacienda-encanto.com, editor@hacienda-encanto.com,
--    jeissondeejay11@gmail.com (DJ)
-- 3. planner@hacienda-encanto.com y asesor@hacienda-encanto.com ya
--    existen desde migración 20260725000002 — solo se actualizan datos
-- Nota: DELETE en auth.users hace CASCADE a profiles y asesor_assignments
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- ─── 1. Eliminar usuarios del dominio viejo ───────────────────

DELETE FROM auth.users
WHERE email IN (
  'planner@haciendaencanto.com',
  'admin@haciendaencanto.com',
  'editor@haciendaencanto.com',
  'dj@haciendaencanto.com',
  'animador@haciendaencanto.com'
);

-- ─── 2. Crear / asegurar usuarios nuevos ─────────────────────

DO $$
DECLARE
  v_id uuid;
BEGIN

  -- ── admin@hacienda-encanto.com ───────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@hacienda-encanto.com') THEN
    v_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      aud, role, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_id, '00000000-0000-0000-0000-000000000000',
      'admin@hacienda-encanto.com',
      extensions.crypt('Admin2026!', extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Admin Hacienda"}'::jsonb,
      'authenticated', 'authenticated', '', '', '', ''
    );
  ELSE
    SELECT id INTO v_id FROM auth.users WHERE email = 'admin@hacienda-encanto.com';
  END IF;
  UPDATE public.profiles SET role = 'admin', full_name = 'Admin Hacienda' WHERE id = v_id;
  RAISE NOTICE 'admin@hacienda-encanto.com → %', v_id;

  -- ── editor@hacienda-encanto.com ──────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'editor@hacienda-encanto.com') THEN
    v_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      aud, role, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_id, '00000000-0000-0000-0000-000000000000',
      'editor@hacienda-encanto.com',
      extensions.crypt('Editor2026!', extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Editor Hacienda"}'::jsonb,
      'authenticated', 'authenticated', '', '', '', ''
    );
  ELSE
    SELECT id INTO v_id FROM auth.users WHERE email = 'editor@hacienda-encanto.com';
  END IF;
  UPDATE public.profiles SET role = 'editor', full_name = 'Editor Hacienda' WHERE id = v_id;
  RAISE NOTICE 'editor@hacienda-encanto.com → %', v_id;

  -- ── jeissondeejay11@gmail.com (DJ / Staff) ───────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'jeissondeejay11@gmail.com') THEN
    v_id := gen_random_uuid();
    INSERT INTO auth.users (
      id, instance_id, email, encrypted_password, email_confirmed_at,
      created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
      aud, role, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      v_id, '00000000-0000-0000-0000-000000000000',
      'jeissondeejay11@gmail.com',
      extensions.crypt('DJ2026!', extensions.gen_salt('bf')),
      now(), now(), now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Staff DJ"}'::jsonb,
      'authenticated', 'authenticated', '', '', '', ''
    );
  ELSE
    SELECT id INTO v_id FROM auth.users WHERE email = 'jeissondeejay11@gmail.com';
  END IF;
  UPDATE public.profiles SET role = 'staff', full_name = 'Staff DJ' WHERE id = v_id;
  RAISE NOTICE 'jeissondeejay11@gmail.com → %', v_id;

  -- ── planner@hacienda-encanto.com (ya existe, asegurar datos) ─
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'planner@hacienda-encanto.com') THEN
    SELECT id INTO v_id FROM auth.users WHERE email = 'planner@hacienda-encanto.com';
    UPDATE public.profiles
    SET role = 'wedding_planner', full_name = 'Jonny Delgado', phone = '573213392181'
    WHERE id = v_id;
    INSERT INTO public.asesor_assignments (asesor_id)
    VALUES (v_id) ON CONFLICT (asesor_id) DO NOTHING;
    RAISE NOTICE 'planner@hacienda-encanto.com (existente) → %', v_id;
  END IF;

  -- ── asesor@hacienda-encanto.com (ya existe, asegurar datos) ──
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = 'asesor@hacienda-encanto.com') THEN
    SELECT id INTO v_id FROM auth.users WHERE email = 'asesor@hacienda-encanto.com';
    UPDATE public.profiles
    SET role = 'asesor_comercial', full_name = 'David Castillo', phone = '573028331190'
    WHERE id = v_id;
    INSERT INTO public.asesor_assignments (asesor_id)
    VALUES (v_id) ON CONFLICT (asesor_id) DO NOTHING;
    RAISE NOTICE 'asesor@hacienda-encanto.com (existente) → %', v_id;
  END IF;

END $$;

-- ─── 3. Verificación final ────────────────────────────────────

DO $$
DECLARE
  r record;
BEGIN
  RAISE NOTICE '=== Usuarios finales en el sistema ===';
  FOR r IN
    SELECT u.email, p.role, p.full_name
    FROM auth.users u
    JOIN public.profiles p ON p.id = u.id
    WHERE u.email NOT LIKE '%@test.com'   -- excluir cliente de prueba
    ORDER BY u.email
  LOOP
    RAISE NOTICE '  % | % | %', r.email, r.role, r.full_name;
  END LOOP;
END $$;
