-- ============================================================
-- Hacienda El Encanto — Storage buckets + políticas de acceso
-- ============================================================

-- ============================================================
-- BUCKETS
-- Convención de rutas:
--   gallery/   → {category}/{filename}
--   videos/    → {filename}
--   documents/ → {booking_id}/{filename}
--   avatars/   → {user_id}/{filename}
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'gallery',
    'gallery',
    true,
    10485760, -- 10 MB
    array['image/jpeg','image/png','image/webp','image/gif','image/svg+xml']
  ),
  (
    'videos',
    'videos',
    true,
    524288000, -- 500 MB
    array['video/mp4','video/webm','video/quicktime','video/mpeg']
  ),
  (
    'documents',
    'documents',
    false, -- privado: acceso controlado por políticas
    52428800, -- 50 MB
    array[
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
  ),
  (
    'avatars',
    'avatars',
    true,
    2097152, -- 2 MB
    array['image/jpeg','image/png','image/webp']
  )
on conflict (id) do nothing;

-- ============================================================
-- POLÍTICAS: gallery  (público para leer, admin para escribir)
-- ============================================================

create policy "gallery: public select"
  on storage.objects for select
  using (bucket_id = 'gallery');

create policy "gallery: admin insert"
  on storage.objects for insert
  with check (bucket_id = 'gallery' and public.is_admin());

create policy "gallery: admin update"
  on storage.objects for update
  using (bucket_id = 'gallery' and public.is_admin());

create policy "gallery: admin delete"
  on storage.objects for delete
  using (bucket_id = 'gallery' and public.is_admin());

-- ============================================================
-- POLÍTICAS: videos  (público para leer, admin para escribir)
-- ============================================================

create policy "videos: public select"
  on storage.objects for select
  using (bucket_id = 'videos');

create policy "videos: admin insert"
  on storage.objects for insert
  with check (bucket_id = 'videos' and public.is_admin());

create policy "videos: admin update"
  on storage.objects for update
  using (bucket_id = 'videos' and public.is_admin());

create policy "videos: admin delete"
  on storage.objects for delete
  using (bucket_id = 'videos' and public.is_admin());

-- ============================================================
-- POLÍTICAS: documents  (privado)
-- Ruta: documents/{booking_id}/{filename}
-- El cliente puede leer documentos de sus propias reservas.
-- Staff/admin puede leer, subir y eliminar cualquiera.
-- ============================================================

create policy "documents: client or staff select"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (
      public.is_staff_or_admin()
      or exists (
        select 1 from public.bookings b
        where b.id::text = (string_to_array(name, '/'))[1]
          and b.client_id = auth.uid()
      )
    )
  );

create policy "documents: staff insert"
  on storage.objects for insert
  with check (bucket_id = 'documents' and public.is_staff_or_admin());

create policy "documents: staff update"
  on storage.objects for update
  using (bucket_id = 'documents' and public.is_staff_or_admin());

create policy "documents: admin delete"
  on storage.objects for delete
  using (bucket_id = 'documents' and public.is_admin());

-- ============================================================
-- POLÍTICAS: avatars  (público para leer, usuario gestiona el suyo)
-- Ruta: avatars/{user_id}/{filename}
-- ============================================================

create policy "avatars: public select"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "avatars: user insert"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "avatars: user update"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );

create policy "avatars: user delete"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (string_to_array(name, '/'))[1]
  );
