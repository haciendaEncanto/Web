-- ============================================================
-- Hacienda El Encanto — Rol editor + gerente
-- Amplía RLS y Storage para que editor gestione contenido
-- ============================================================

-- 1. Nuevos valores del enum (separados en ALTER TYPE para evitar
--    conflictos de transacción con código que los referencia)
alter type public.user_role add value if not exists 'editor';
alter type public.user_role add value if not exists 'gerente';
