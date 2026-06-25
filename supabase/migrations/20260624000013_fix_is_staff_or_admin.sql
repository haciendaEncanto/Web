-- ============================================================
-- Fix: is_staff_or_admin() no incluía los roles agregados en
-- 20260624000003 (wedding_planner, asesor_comercial, asesor_logistica).
-- Todas las políticas RLS que usan esta función (bookings, sections,
-- items, galería, paquetes, testimonios, etc.) ahora aplican
-- correctamente a todos los roles de staff.
-- ============================================================

create or replace function public.is_staff_or_admin()
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'staff', 'wedding_planner', 'asesor_comercial', 'asesor_logistica')
  );
$$;
