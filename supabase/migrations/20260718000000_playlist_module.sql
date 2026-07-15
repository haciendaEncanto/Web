-- Módulo de playlist del cliente (/portal/playlist)
-- ============================================================

-- Secciones nuevas requeridas por las plantillas de boda/quince/
-- empresarial/revelación. 'centinela' guarda el toggle único de
-- "llevo acompañamiento musical propio" como una fila más (no_aplica
-- funciona como el booleano del toggle), evitando una columna aparte.
alter type public.playlist_section add value if not exists 'vals_opcion_2';
alter type public.playlist_section add value if not exists 'vals_opcion_3';
alter type public.playlist_section add value if not exists 'acompanamiento_salon';
alter type public.playlist_section add value if not exists 'playlist_ceremonia';
alter type public.playlist_section add value if not exists 'observaciones';
alter type public.playlist_section add value if not exists 'centinela';

-- La política de SELECT original daba a "staff" acceso a TODAS las
-- playlists sin restricción. El requisito es: staff (DJ, animador,
-- sonido) solo ve playlists de bookings con status pending/confirmed
-- (eventos activos). admin/wedding_planner siguen viendo todo.
drop policy if exists "playlists: select" on public.playlists;

create policy "playlists: select"
  on public.playlists for select
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'wedding_planner')
    )
    or exists (
      select 1 from public.profiles p
      join public.bookings b on b.id = booking_id
      where p.id = auth.uid()
        and p.role = 'staff'
        and b.status in ('pending', 'confirmed')
    )
  );
