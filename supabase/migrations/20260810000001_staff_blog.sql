-- Módulos Staff y Blog
-- Aplicar con: supabase db push

-- ─── STAFF ────────────────────────────────────────────────────────────────────

create table public.staff (
  id          uuid        default gen_random_uuid() primary key,
  nombre      text        not null,
  cargo       text        not null,
  descripcion text,
  foto_url    text,
  sort_order  integer     not null default 0,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.staff enable row level security;

-- Lectura pública solo de miembros activos
create policy "staff_public_select" on public.staff
  for select using (is_active = true);

-- ─── BLOG POSTS ───────────────────────────────────────────────────────────────

create table public.blog_posts (
  id           uuid        default gen_random_uuid() primary key,
  titulo       text        not null,
  slug         text        unique not null,
  resumen      text,
  contenido    text,
  foto_url     text,
  autor        text,
  is_published boolean     not null default false,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

alter table public.blog_posts enable row level security;

-- Lectura pública solo de artículos publicados
create policy "blog_public_select" on public.blog_posts
  for select using (is_published = true);

-- Nota: las mutaciones de admin/editor usan createAdminClient() que bypasa RLS.
