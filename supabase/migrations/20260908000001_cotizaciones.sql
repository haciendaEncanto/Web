-- Tabla de configuración de precios para cotizaciones
create table if not exists public.cotizacion_config (
  id          uuid        primary key default gen_random_uuid(),
  clave       text        not null unique,
  valor       numeric     not null,
  descripcion text        not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.cotizacion_config enable row level security;

create policy "Admin gestiona config cotizaciones" on public.cotizacion_config
  for all
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role = 'admin'
    )
  );

create policy "Asesores y planner leen config" on public.cotizacion_config
  for select
  using (
    exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('asesor_comercial', 'wedding_planner', 'admin')
    )
  );

-- Tabla para guardar cotizaciones generadas
create table if not exists public.cotizaciones (
  id               uuid        primary key default gen_random_uuid(),
  created_by       uuid        references auth.users(id),
  tipo_evento      text        not null,
  nombre_cliente   text        not null,
  fecha_evento     date,
  promo_hasta      date,
  num_invitados    integer     not null,
  dia_semana       text        not null default 'sabado_noche',
  precio_calculado numeric,
  pdf_url          text,
  whatsapp_cliente text,
  created_at       timestamptz not null default now()
);

alter table public.cotizaciones enable row level security;

create policy "Asesor y planner gestionan cotizaciones" on public.cotizaciones
  for all
  using (
    auth.uid() = created_by
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'wedding_planner')
    )
  )
  with check (
    auth.uid() = created_by
    or exists (
      select 1 from public.profiles
      where profiles.id = auth.uid()
      and profiles.role in ('admin', 'wedding_planner')
    )
  );

-- Seed valores iniciales
insert into public.cotizacion_config (clave, valor, descripcion) values
  ('precio_por_persona',             120000, 'Precio por persona (para ≥60 invitados)'),
  ('costo_fijo_hacienda',           6000000, 'Costo fijo de la hacienda'),
  ('costo_adicional',               2500000, 'Costo adicional base'),
  ('costo_base_menos_60',          14400000, 'Costo base para menos de 60 invitados'),
  ('ajuste_por_invitado_menos_60',    35000, 'Ajuste por invitado cuando hay menos de 60'),
  ('fee_porcentaje',                     36, 'Fee en porcentaje (%)'),
  ('descuento_volumen_menor_68',         15, 'Descuento por volumen ≤68 invitados (%)'),
  ('descuento_volumen_mayor_69',         20, 'Descuento por volumen ≥69 invitados (%)'),
  ('descuento_sabado_noche',             20, 'Descuento sábado noche (%)'),
  ('descuento_viernes',                  30, 'Descuento viernes (%)'),
  ('descuento_domingo',                  35, 'Descuento domingo (%)'),
  ('descuento_sabado_dia_lunes_jueves',  40, 'Descuento sábado día / lunes–jueves (%)')
on conflict (clave) do nothing;
