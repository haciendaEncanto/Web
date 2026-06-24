-- ============================================================
-- Hacienda El Encanto — Ampliar enum user_role (3 nuevos roles)
-- Migración separada: ALTER TYPE ADD VALUE no puede usarse en
-- la misma transacción que código que referencie el nuevo valor.
-- ============================================================

alter type public.user_role add value if not exists 'wedding_planner';
alter type public.user_role add value if not exists 'asesor_comercial';
alter type public.user_role add value if not exists 'asesor_logistica';
