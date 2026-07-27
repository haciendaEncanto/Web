-- ============================================================
-- Hacienda El Encanto — Campos extra en contact_messages
-- 1. contact_messages: event_date, guest_count (text nullable)
--    email pasa a ser nullable (es opcional en el formulario)
-- 2. profiles: callmebot_api_key para notificaciones por asesor
-- ============================================================

-- 1 ─ contact_messages ──────────────────────────────────────

ALTER TABLE public.contact_messages
  ALTER COLUMN email DROP NOT NULL,
  ADD COLUMN IF NOT EXISTS event_date  text,
  ADD COLUMN IF NOT EXISTS guest_count text;

-- 2 ─ profiles ─────────────────────────────────────────────

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS callmebot_api_key text;
