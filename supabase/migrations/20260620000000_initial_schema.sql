-- ============================================================
-- Hacienda El Encanto — Fase 1: Esquema base de datos
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

create type user_role            as enum ('client', 'staff', 'admin');
create type booking_status       as enum ('pending', 'confirmed', 'cancelled', 'completed');
create type payment_method_type  as enum ('transferencia', 'efectivo', 'cheque', 'otro');
create type contact_status       as enum ('unread', 'read', 'replied');
create type document_type        as enum ('contrato');
create type service_order_status as enum ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled');

-- ============================================================
-- SHARED TRIGGER: updated_at
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- TABLE: profiles  (extends auth.users 1:1)
-- ============================================================

create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  email       text        not null,
  full_name   text,
  phone       text,
  role        user_role   not null default 'client',
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- ============================================================
-- HELPER FUNCTIONS (security definer → bypass RLS in policies)
-- Defined here because they reference public.profiles
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.is_staff_or_admin()
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('staff', 'admin')
  );
$$;

-- users see their own row; staff/admin see everyone
create policy "profiles: select"
  on public.profiles for select
  using (auth.uid() = id or public.is_staff_or_admin());

-- users update their own data; only admins can change role
create policy "profiles: update"
  on public.profiles for update
  using (auth.uid() = id or public.is_admin())
  with check (
    public.is_admin()
    or role = (select role from public.profiles where id = auth.uid())
  );

create policy "profiles: admin delete"
  on public.profiles for delete
  using (public.is_admin());

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============================================================
-- TABLE: spaces  (salones / zonas del evento — gestionados por admin)
-- ============================================================

create table public.spaces (
  id            uuid        primary key default gen_random_uuid(),
  name          text        not null,
  slug          text        not null unique,
  description   text,
  capacity_min  int,
  capacity_max  int,
  area_m2       numeric(8,2),
  base_price    numeric(12,2),
  amenities     jsonb       not null default '[]',
  is_active     boolean     not null default true,
  sort_order    int         not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.spaces enable row level security;

create policy "spaces: select"
  on public.spaces for select
  using (is_active = true or public.is_staff_or_admin());

create policy "spaces: admin insert"
  on public.spaces for insert
  with check (public.is_admin());

create policy "spaces: admin update"
  on public.spaces for update
  using (public.is_admin());

create policy "spaces: admin delete"
  on public.spaces for delete
  using (public.is_admin());

create trigger spaces_updated_at
  before update on public.spaces
  for each row execute function public.set_updated_at();

-- ============================================================
-- TABLE: packages  (paquetes de servicio)
-- ============================================================

create table public.packages (
  id          uuid        primary key default gen_random_uuid(),
  name        text        not null,
  description text,
  price       numeric(12,2) not null default 0,
  includes    jsonb       not null default '[]',
  is_active   boolean     not null default true,
  sort_order  int         not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.packages enable row level security;

create policy "packages: select"
  on public.packages for select
  using (is_active = true or public.is_staff_or_admin());

create policy "packages: admin insert"
  on public.packages for insert
  with check (public.is_admin());

create policy "packages: admin update"
  on public.packages for update
  using (public.is_admin());

create policy "packages: admin delete"
  on public.packages for delete
  using (public.is_admin());

create trigger packages_updated_at
  before update on public.packages
  for each row execute function public.set_updated_at();

-- ============================================================
-- TABLE: bookings  (reservas de eventos)
-- ============================================================

create table public.bookings (
  id               uuid           primary key default gen_random_uuid(),
  client_id        uuid           not null references public.profiles(id) on delete restrict,
  space_id         uuid           not null references public.spaces(id) on delete restrict,
  event_date       date           not null,
  event_start_time time           not null,
  event_end_time   time           not null,
  guest_count      int            not null default 1 check (guest_count > 0),
  event_type       text           not null,
  status           booking_status not null default 'pending',
  notes            text,
  total_amount     numeric(12,2)  not null default 0,
  created_at       timestamptz    not null default now(),
  updated_at       timestamptz    not null default now()
);

alter table public.bookings enable row level security;

-- client sees own; staff/admin see all
create policy "bookings: select"
  on public.bookings for select
  using (client_id = auth.uid() or public.is_staff_or_admin());

-- authenticated users can create a booking for themselves
create policy "bookings: client insert"
  on public.bookings for insert
  with check (auth.uid() is not null and client_id = auth.uid());

-- staff/admin can update any; client can only cancel their own pending booking
create policy "bookings: update"
  on public.bookings for update
  using (
    public.is_staff_or_admin()
    or (client_id = auth.uid() and status = 'pending')
  );

create policy "bookings: admin delete"
  on public.bookings for delete
  using (public.is_admin());

create trigger bookings_updated_at
  before update on public.bookings
  for each row execute function public.set_updated_at();

-- ============================================================
-- TABLE: booking_packages  (paquetes incluidos en una reserva)
-- ============================================================

create table public.booking_packages (
  id          uuid        primary key default gen_random_uuid(),
  booking_id  uuid        not null references public.bookings(id) on delete cascade,
  package_id  uuid        not null references public.packages(id) on delete restrict,
  quantity    int         not null default 1 check (quantity > 0),
  unit_price  numeric(12,2) not null,
  created_at  timestamptz not null default now(),
  unique (booking_id, package_id)
);

alter table public.booking_packages enable row level security;

create policy "booking_packages: select"
  on public.booking_packages for select
  using (
    public.is_staff_or_admin()
    or exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
  );

create policy "booking_packages: staff insert"
  on public.booking_packages for insert
  with check (public.is_staff_or_admin());

create policy "booking_packages: staff update"
  on public.booking_packages for update
  using (public.is_staff_or_admin());

create policy "booking_packages: staff delete"
  on public.booking_packages for delete
  using (public.is_staff_or_admin());

-- ============================================================
-- TABLE: payments  (pagos manuales, sin pasarela)
-- ============================================================

create table public.payments (
  id               uuid               primary key default gen_random_uuid(),
  booking_id       uuid               not null references public.bookings(id) on delete restrict,
  amount           numeric(12,2)      not null check (amount > 0),
  payment_date     date               not null default current_date,
  payment_method   payment_method_type not null default 'transferencia',
  reference_number text,
  notes            text,
  recorded_by      uuid               references public.profiles(id) on delete set null,
  created_at       timestamptz        not null default now(),
  updated_at       timestamptz        not null default now()
);

alter table public.payments enable row level security;

-- client sees payments on their own bookings; staff/admin see all
create policy "payments: select"
  on public.payments for select
  using (
    public.is_staff_or_admin()
    or exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
  );

create policy "payments: staff insert"
  on public.payments for insert
  with check (public.is_staff_or_admin());

create policy "payments: staff update"
  on public.payments for update
  using (public.is_staff_or_admin());

create policy "payments: admin delete"
  on public.payments for delete
  using (public.is_admin());

create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

-- ============================================================
-- TABLE: contact_messages  (formulario de contacto público)
-- ============================================================

create table public.contact_messages (
  id          uuid           primary key default gen_random_uuid(),
  name        text           not null,
  email       text           not null,
  phone       text,
  subject     text,
  message     text           not null,
  status      contact_status not null default 'unread',
  created_at  timestamptz    not null default now()
);

alter table public.contact_messages enable row level security;

-- anyone (including anonymous) puede enviar
create policy "contact_messages: public insert"
  on public.contact_messages for insert
  with check (true);

create policy "contact_messages: staff select"
  on public.contact_messages for select
  using (public.is_staff_or_admin());

create policy "contact_messages: staff update"
  on public.contact_messages for update
  using (public.is_staff_or_admin());

create policy "contact_messages: admin delete"
  on public.contact_messages for delete
  using (public.is_admin());

-- ============================================================
-- TABLE: testimonials
-- ============================================================

create table public.testimonials (
  id            uuid        primary key default gen_random_uuid(),
  client_name   text        not null,
  event_type    text,
  rating        int         check (rating between 1 and 5),
  content       text        not null,
  is_published  boolean     not null default false,
  sort_order    int         not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.testimonials enable row level security;

create policy "testimonials: select"
  on public.testimonials for select
  using (is_published = true or public.is_staff_or_admin());

create policy "testimonials: admin insert"
  on public.testimonials for insert
  with check (public.is_admin());

create policy "testimonials: admin update"
  on public.testimonials for update
  using (public.is_admin());

create policy "testimonials: admin delete"
  on public.testimonials for delete
  using (public.is_admin());

create trigger testimonials_updated_at
  before update on public.testimonials
  for each row execute function public.set_updated_at();

-- ============================================================
-- TABLE: gallery_images
-- ============================================================

create table public.gallery_images (
  id            uuid        primary key default gen_random_uuid(),
  title         text,
  description   text,
  url           text        not null,
  category      text,
  sort_order    int         not null default 0,
  is_published  boolean     not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.gallery_images enable row level security;

create policy "gallery_images: select"
  on public.gallery_images for select
  using (is_published = true or public.is_staff_or_admin());

create policy "gallery_images: admin insert"
  on public.gallery_images for insert
  with check (public.is_admin());

create policy "gallery_images: admin update"
  on public.gallery_images for update
  using (public.is_admin());

create policy "gallery_images: admin delete"
  on public.gallery_images for delete
  using (public.is_admin());

create trigger gallery_images_updated_at
  before update on public.gallery_images
  for each row execute function public.set_updated_at();

-- ============================================================
-- TABLE: service_orders  (ítems de servicio por reserva — se importa desde Excel)
-- ============================================================

create table public.service_orders (
  id                uuid                 primary key default gen_random_uuid(),
  booking_id        uuid                 not null references public.bookings(id) on delete cascade,
  service_name      text                 not null,
  service_category  text,
  quantity          numeric(10,3)        not null default 1 check (quantity > 0),
  unit              text,
  unit_price        numeric(12,2)        not null default 0,
  total_price       numeric(12,2)        generated always as (quantity * unit_price) stored,
  notes             text,
  status            service_order_status not null default 'pending',
  created_at        timestamptz          not null default now(),
  updated_at        timestamptz          not null default now()
);

alter table public.service_orders enable row level security;

create policy "service_orders: select"
  on public.service_orders for select
  using (
    public.is_staff_or_admin()
    or exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
  );

create policy "service_orders: staff insert"
  on public.service_orders for insert
  with check (public.is_staff_or_admin());

create policy "service_orders: staff update"
  on public.service_orders for update
  using (public.is_staff_or_admin());

create policy "service_orders: admin delete"
  on public.service_orders for delete
  using (public.is_admin());

create trigger service_orders_updated_at
  before update on public.service_orders
  for each row execute function public.set_updated_at();

-- ============================================================
-- TABLE: documents  (por ahora solo 'contrato')
-- ============================================================

create table public.documents (
  id          uuid          primary key default gen_random_uuid(),
  booking_id  uuid          not null references public.bookings(id) on delete restrict,
  type        document_type not null default 'contrato',
  title       text          not null,
  file_url    text,
  signed_at   timestamptz,
  created_by  uuid          references public.profiles(id) on delete set null,
  created_at  timestamptz   not null default now(),
  updated_at  timestamptz   not null default now()
);

alter table public.documents enable row level security;

create policy "documents: select"
  on public.documents for select
  using (
    public.is_staff_or_admin()
    or exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
  );

create policy "documents: staff insert"
  on public.documents for insert
  with check (public.is_staff_or_admin());

create policy "documents: staff update"
  on public.documents for update
  using (public.is_staff_or_admin());

create policy "documents: admin delete"
  on public.documents for delete
  using (public.is_admin());

create trigger documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

-- ============================================================
-- TABLE: messages  (mensajería interna cliente ↔ staff)
-- ============================================================

create table public.messages (
  id          uuid        primary key default gen_random_uuid(),
  sender_id   uuid        not null references public.profiles(id) on delete cascade,
  receiver_id uuid        not null references public.profiles(id) on delete cascade,
  booking_id  uuid        references public.bookings(id) on delete set null,
  content     text        not null,
  is_read     boolean     not null default false,
  created_at  timestamptz not null default now()
);

alter table public.messages enable row level security;

-- participants see their own thread; admin sees all
create policy "messages: select"
  on public.messages for select
  using (sender_id = auth.uid() or receiver_id = auth.uid() or public.is_admin());

create policy "messages: authenticated insert"
  on public.messages for insert
  with check (auth.uid() is not null and sender_id = auth.uid());

-- receiver marks as read; admin can update any
create policy "messages: update"
  on public.messages for update
  using (receiver_id = auth.uid() or public.is_admin());

create policy "messages: admin delete"
  on public.messages for delete
  using (public.is_admin());

-- ============================================================
-- TABLE: notifications
-- ============================================================

create table public.notifications (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  title       text        not null,
  body        text,
  type        text        not null,
  is_read     boolean     not null default false,
  data        jsonb       not null default '{}',
  created_at  timestamptz not null default now()
);

alter table public.notifications enable row level security;

create policy "notifications: select"
  on public.notifications for select
  using (user_id = auth.uid() or public.is_admin());

-- only staff/admin can create notifications programmatically
create policy "notifications: staff insert"
  on public.notifications for insert
  with check (public.is_staff_or_admin());

-- users mark their own as read; admin can update any
create policy "notifications: update"
  on public.notifications for update
  using (user_id = auth.uid() or public.is_admin());

create policy "notifications: delete"
  on public.notifications for delete
  using (user_id = auth.uid() or public.is_admin());

-- ============================================================
-- TABLE: site_content  (contenido editable del sitio — CMS ligero)
-- ============================================================

create table public.site_content (
  id          uuid        primary key default gen_random_uuid(),
  key         text        not null unique,
  title       text,
  content     text,
  data        jsonb       not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.site_content enable row level security;

create policy "site_content: public select"
  on public.site_content for select
  using (true);

create policy "site_content: admin insert"
  on public.site_content for insert
  with check (public.is_admin());

create policy "site_content: admin update"
  on public.site_content for update
  using (public.is_admin());

create policy "site_content: admin delete"
  on public.site_content for delete
  using (public.is_admin());

create trigger site_content_updated_at
  before update on public.site_content
  for each row execute function public.set_updated_at();

-- ============================================================
-- TABLE: hero_videos
-- ============================================================

create table public.hero_videos (
  id             uuid        primary key default gen_random_uuid(),
  title          text,
  url            text        not null,
  thumbnail_url  text,
  is_active      boolean     not null default true,
  sort_order     int         not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

alter table public.hero_videos enable row level security;

create policy "hero_videos: select"
  on public.hero_videos for select
  using (is_active = true or public.is_staff_or_admin());

create policy "hero_videos: admin insert"
  on public.hero_videos for insert
  with check (public.is_admin());

create policy "hero_videos: admin update"
  on public.hero_videos for update
  using (public.is_admin());

create policy "hero_videos: admin delete"
  on public.hero_videos for delete
  using (public.is_admin());

create trigger hero_videos_updated_at
  before update on public.hero_videos
  for each row execute function public.set_updated_at();

-- ============================================================
-- INDEXES
-- ============================================================

create index on public.spaces (slug);
create index on public.bookings (client_id);
create index on public.bookings (space_id);
create index on public.bookings (event_date);
create index on public.bookings (status);
create index on public.booking_packages (booking_id);
create index on public.payments (booking_id);
create index on public.service_orders (booking_id);
create index on public.service_orders (status);
create index on public.documents (booking_id);
create index on public.messages (sender_id);
create index on public.messages (receiver_id);
create index on public.notifications (user_id);
create index on public.notifications (user_id) where is_read = false;
create index on public.site_content (key);
