-- ============================================================
-- Hacienda El Encanto — Tabla client_activities + parche templates
-- ============================================================

-- ─── Tabla de actividades programadas por el planner ─────────────────

create table public.client_activities (
  id            uuid        primary key default gen_random_uuid(),
  booking_id    uuid        not null references public.bookings(id) on delete cascade,
  title         text        not null,
  activity_date date        not null,
  activity_time time,
  location      text,
  notes         text,
  created_by    uuid        references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now()
);

alter table public.client_activities enable row level security;

-- Cliente ve sus propias actividades; staff/admin ven todas
create policy "ca: client select"
  on public.client_activities for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
    or public.is_staff_or_admin()
  );

create policy "ca: planner insert"
  on public.client_activities for insert
  with check (public.is_planner_or_admin());

create policy "ca: planner update"
  on public.client_activities for update
  using (public.is_planner_or_admin());

create policy "ca: planner delete"
  on public.client_activities for delete
  using (public.is_planner_or_admin());

create index on public.client_activities (booking_id, activity_date);

-- ─── Parche de plantillas: 'Descripción de actividades adicionales' ──
-- Se renderiza justo después de 'Actividades adicionales' en la UI.
-- sort=120 garantiza que no colisione con items existentes.

insert into public.service_order_templates
  (event_type, section_name, section_sort, item_label, item_type, options, item_sort, filled_by, notes)
values
  ('boda',        'Protocolo', 4, 'Descripción de actividades adicionales', 'textarea', '[]', 120, 'planner',
   'Solo visible cuando "Actividades adicionales" = Sí'),
  ('quince',      'Ceremonia', 3, 'Descripción de actividades adicionales', 'textarea', '[]', 120, 'planner',
   'Solo visible cuando "Actividades adicionales" = Sí'),
  ('empresarial', 'Programa',  3, 'Descripción de actividades adicionales', 'textarea', '[]', 120, 'planner',
   'Solo visible cuando "Actividades adicionales" = Sí'),
  ('revelacion',  'Programa',  3, 'Descripción de actividades adicionales', 'textarea', '[]', 120, 'planner',
   'Solo visible cuando "Actividades adicionales" = Sí');
