-- ============================================================
-- Hacienda El Encanto — Tabla booking_events
-- Registro inmutable de eventos significativos por reserva.
-- Primer uso: motivo de reinicio de orden de servicio.
-- ============================================================

create table if not exists public.booking_events (
  id          uuid        primary key default gen_random_uuid(),
  booking_id  uuid        not null references public.bookings(id) on delete cascade,
  event_type  text        not null,  -- 'service_order_reinit', 'service_order_init', etc.
  actor_id    uuid        references public.profiles(id) on delete set null,
  notes       text,
  created_at  timestamptz not null default now()
);

alter table public.booking_events enable row level security;

-- Solo staff/admin pueden ver el historial
create policy "be: staff select"
  on public.booking_events for select
  using (public.is_staff_or_admin());

-- Planner/admin pueden registrar eventos
create policy "be: planner insert"
  on public.booking_events for insert
  with check (public.is_planner_or_admin());

-- Los eventos son inmutables — sin UPDATE
-- Solo admin puede borrar (emergencia)
create policy "be: admin delete"
  on public.booking_events for delete
  using (public.is_admin());

create index on public.booking_events (booking_id, created_at desc);
