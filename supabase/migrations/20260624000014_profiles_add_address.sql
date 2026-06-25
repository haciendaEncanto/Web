-- ============================================================
-- Agrega dirección de residencia al perfil del cliente
-- ============================================================
alter table public.profiles
  add column if not exists address text null;
