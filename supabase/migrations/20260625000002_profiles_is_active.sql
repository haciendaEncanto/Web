-- Agrega is_active a profiles para soporte de cancelación de clientes (soft delete).
-- DEFAULT true: todos los perfiles existentes quedan activos.

alter table public.profiles
  add column if not exists is_active boolean not null default true;
