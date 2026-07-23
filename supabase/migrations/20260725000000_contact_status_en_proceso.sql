-- ============================================================
-- Hacienda El Encanto — Ampliar contact_status con 'en_proceso'
-- Migración separada: ALTER TYPE ADD VALUE no puede usarse en
-- la misma transacción que código que referencie el nuevo valor.
-- ============================================================
alter type public.contact_status add value if not exists 'en_proceso';
