-- ============================================================
-- Hacienda El Encanto — Nuevas tablas: playlists, guest_tables,
-- calendar_events + funciones RLS para roles extendidos
-- Depende de: 20260624000003_add_enum_roles.sql (enum ya aplicado)
-- ============================================================

-- ╔══════════════════════════════════════════════════════════╗
-- ║  1. Enum: secciones de playlist por tipo de evento       ║
-- ╚══════════════════════════════════════════════════════════╝

do $$ begin
  create type public.playlist_section as enum (
    -- Boda
    'entrada_novio',
    'entrada_novia',
    'salida_recien_casados',
    -- Boda + Quinceañera
    'entrada_salon',
    'vals_pareja',
    'vals_padres_novia',
    'vals_padres_novio',
    'playlist_cena',
    'playlist_rumba',
    -- Quinceañera + Empresarial + Revelación
    'entrada_zona_verde',
    -- Empresarial + Revelación
    'acompanamiento_zona_verde'
  );
exception when duplicate_object then null;
end $$;

-- ╔══════════════════════════════════════════════════════════╗
-- ║  2. Funciones helper RLS para los nuevos roles           ║
-- ╚══════════════════════════════════════════════════════════╝

-- wedding_planner + admin: coordinan eventos y gestionan agenda
create or replace function public.is_planner_or_admin()
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'wedding_planner')
  );
$$;

-- Cualquier rol de staff (excepto client): acceso a calendario y panorama global
create or replace function public.is_any_staff()
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'wedding_planner', 'asesor_comercial', 'asesor_logistica', 'staff')
  );
$$;

-- ╔══════════════════════════════════════════════════════════╗
-- ║  3. TABLA: playlists                                     ║
-- ╚══════════════════════════════════════════════════════════╝
-- Una fila por (booking, section). Cliente llena, staff autorizado lee.
-- asesor_comercial y asesor_logistica NO tienen acceso.

create table if not exists public.playlists (
  id          uuid                    primary key default gen_random_uuid(),
  booking_id  uuid                    not null references public.bookings(id) on delete cascade,
  section     public.playlist_section not null,
  song_name   text,
  song_url    text,
  no_aplica   boolean                 not null default false,
  created_at  timestamptz             not null default now(),
  updated_at  timestamptz             not null default now(),
  unique (booking_id, section)
);

alter table public.playlists enable row level security;

-- SELECT: cliente (booking propio) + admin + wedding_planner + staff
create policy "playlists: select"
  on public.playlists for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'wedding_planner', 'staff')
    )
  );

-- INSERT: cliente (booking propio) + admin
create policy "playlists: insert"
  on public.playlists for insert
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
    or public.is_admin()
  );

-- UPDATE: cliente (booking propio) + admin
create policy "playlists: update"
  on public.playlists for update
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
    or public.is_admin()
  );

-- DELETE: admin
create policy "playlists: admin delete"
  on public.playlists for delete
  using (public.is_admin());

create trigger playlists_updated_at
  before update on public.playlists
  for each row execute function public.set_updated_at();

create index on public.playlists (booking_id);

-- ╔══════════════════════════════════════════════════════════╗
-- ║  4. TABLA: guest_tables (distribución de invitados)      ║
-- ╚══════════════════════════════════════════════════════════╝
-- El cliente sube el Excel; puede haber varias versiones históricas.

create table if not exists public.guest_tables (
  id          uuid        primary key default gen_random_uuid(),
  booking_id  uuid        not null references public.bookings(id) on delete cascade,
  file_url    text,
  uploaded_at timestamptz not null default now(),
  notes       text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.guest_tables enable row level security;

-- SELECT: cliente (booking propio) + wedding_planner + admin
create policy "guest_tables: select"
  on public.guest_tables for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
    or public.is_planner_or_admin()
  );

-- INSERT: cliente (booking propio) + admin
create policy "guest_tables: insert"
  on public.guest_tables for insert
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
    or public.is_admin()
  );

-- UPDATE: cliente (booking propio) + admin
create policy "guest_tables: update"
  on public.guest_tables for update
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
    or public.is_admin()
  );

-- DELETE: admin
create policy "guest_tables: admin delete"
  on public.guest_tables for delete
  using (public.is_admin());

create trigger guest_tables_updated_at
  before update on public.guest_tables
  for each row execute function public.set_updated_at();

create index on public.guest_tables (booking_id);

-- ╔══════════════════════════════════════════════════════════╗
-- ║  5. TABLA: calendar_events                               ║
-- ╚══════════════════════════════════════════════════════════╝
-- Calendario central de eventos. booking_id nullable permite
-- bloquear fechas antes de que exista una reserva formal.
-- Staff interno ve todo; el cliente solo ve su propio evento.

create table if not exists public.calendar_events (
  id          uuid        primary key default gen_random_uuid(),
  booking_id  uuid        references public.bookings(id) on delete set null,
  client_name text        not null,
  event_type  text        not null,
  start_time  timestamptz not null,
  end_time    timestamptz not null,
  guest_count int,
  notes       text,
  created_by  uuid        references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.calendar_events enable row level security;

-- SELECT: cliente (su booking) + todo staff interno
create policy "calendar_events: select"
  on public.calendar_events for select
  using (
    (
      booking_id is not null
      and exists (
        select 1 from public.bookings b
        where b.id = booking_id and b.client_id = auth.uid()
      )
    )
    or public.is_any_staff()
  );

-- INSERT: wedding_planner + admin
create policy "calendar_events: planner insert"
  on public.calendar_events for insert
  with check (public.is_planner_or_admin());

-- UPDATE: wedding_planner + admin
create policy "calendar_events: planner update"
  on public.calendar_events for update
  using (public.is_planner_or_admin())
  with check (public.is_planner_or_admin());

-- DELETE: admin
create policy "calendar_events: admin delete"
  on public.calendar_events for delete
  using (public.is_admin());

create trigger calendar_events_updated_at
  before update on public.calendar_events
  for each row execute function public.set_updated_at();

create index on public.calendar_events (booking_id);
create index on public.calendar_events (start_time);
create index on public.calendar_events (event_type);
