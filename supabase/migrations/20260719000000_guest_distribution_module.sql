-- Módulo de distribución de invitados por mesa
-- ============================================================

-- ╔══════════════════════════════════════════════════════════╗
-- ║  1. TABLA: salon_maps                                    ║
-- ╚══════════════════════════════════════════════════════════╝
-- Mapas de distribución del salón, uno por rango de invitados.
-- Rango individual para 30/40/.../110, rango compartido 120-150.
-- El cliente ve el mapa cuyo rango cubre su bookings.guest_count.

create table if not exists public.salon_maps (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  image_url   text        not null,
  min_guests  int         not null,
  max_guests  int         not null,
  is_active   boolean     not null default true,
  created_by  uuid        references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint salon_maps_range_valid check (max_guests >= min_guests)
);

alter table public.salon_maps enable row level security;

-- SELECT: cualquier usuario autenticado (cliente incluido) puede leer
create policy "salon_maps: select"
  on public.salon_maps for select
  using (auth.uid() is not null);

-- INSERT/UPDATE/DELETE: solo planner y admin
create policy "salon_maps: planner insert"
  on public.salon_maps for insert
  with check (public.is_planner_or_admin());

create policy "salon_maps: planner update"
  on public.salon_maps for update
  using (public.is_planner_or_admin())
  with check (public.is_planner_or_admin());

create policy "salon_maps: planner delete"
  on public.salon_maps for delete
  using (public.is_planner_or_admin());

create index on public.salon_maps (min_guests, max_guests) where is_active;

-- ╔══════════════════════════════════════════════════════════╗
-- ║  2. guest_tables — permitir al cliente eliminar su        ║
-- ║     propio historial de archivos subidos                 ║
-- ╚══════════════════════════════════════════════════════════╝
-- La política original solo dejaba borrar a admin. El cliente debe
-- poder eliminar los Excel que él mismo subió para su evento.

create policy "guest_tables: client delete"
  on public.guest_tables for delete
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
  );

-- ╔══════════════════════════════════════════════════════════╗
-- ║  3. Bucket documents — permitir Excel de invitados        ║
-- ╚══════════════════════════════════════════════════════════╝

update storage.buckets
set allowed_mime_types = (
  select array_agg(distinct mime)
  from unnest(
    allowed_mime_types || array[
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ]
  ) as mime
)
where id = 'documents';
