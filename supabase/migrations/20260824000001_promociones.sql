-- Tabla de banners promocionales
create table if not exists public.promociones (
  id           uuid        primary key default gen_random_uuid(),
  imagen_url   text        not null,
  fecha_inicio date        not null,
  fecha_fin    date        not null,
  sort_order   int         not null default 0,
  is_active    boolean     not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.promociones enable row level security;

-- Público: solo promociones activas y dentro del rango de fechas
create policy "Público ve promociones activas y vigentes" on public.promociones
  for select
  using (
    is_active = true
    and fecha_inicio <= current_date
    and fecha_fin    >= current_date
  );

-- Admin y editor: gestión completa
create policy "Admin y editor gestionan promociones" on public.promociones
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'editor')
    )
  );
