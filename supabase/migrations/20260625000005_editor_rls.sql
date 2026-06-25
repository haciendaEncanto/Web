-- ============================================================
-- RLS + Storage policies para el rol editor
-- Ejecutar DESPUÉS de 20260625000004 (enum ya existe)
-- ============================================================

-- Helper: is_editor() — true para admin y editor
create or replace function public.is_editor()
returns boolean language sql stable security definer
set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'editor')
  );
$$;

-- ─── gallery_images ───────────────────────────────────────────
drop policy if exists "gallery_images: admin insert" on public.gallery_images;
drop policy if exists "gallery_images: admin update" on public.gallery_images;
drop policy if exists "gallery_images: admin delete" on public.gallery_images;

create policy "gallery_images: editor insert"
  on public.gallery_images for insert
  with check (public.is_editor());

create policy "gallery_images: editor update"
  on public.gallery_images for update
  using (public.is_editor());

create policy "gallery_images: editor delete"
  on public.gallery_images for delete
  using (public.is_editor());

-- ─── hero_videos ─────────────────────────────────────────────
drop policy if exists "hero_videos: admin insert" on public.hero_videos;
drop policy if exists "hero_videos: admin update" on public.hero_videos;
drop policy if exists "hero_videos: admin delete" on public.hero_videos;

create policy "hero_videos: editor insert"
  on public.hero_videos for insert
  with check (public.is_editor());

create policy "hero_videos: editor update"
  on public.hero_videos for update
  using (public.is_editor());

create policy "hero_videos: editor delete"
  on public.hero_videos for delete
  using (public.is_editor());

-- ─── testimonials ────────────────────────────────────────────
drop policy if exists "testimonials: admin insert" on public.testimonials;
drop policy if exists "testimonials: admin update" on public.testimonials;
drop policy if exists "testimonials: admin delete" on public.testimonials;

create policy "testimonials: editor insert"
  on public.testimonials for insert
  with check (public.is_editor());

create policy "testimonials: editor update"
  on public.testimonials for update
  using (public.is_editor());

create policy "testimonials: editor delete"
  on public.testimonials for delete
  using (public.is_editor());

-- ─── packages ────────────────────────────────────────────────
drop policy if exists "packages: admin insert" on public.packages;
drop policy if exists "packages: admin update" on public.packages;
drop policy if exists "packages: admin delete" on public.packages;

create policy "packages: editor insert"
  on public.packages for insert
  with check (public.is_editor());

create policy "packages: editor update"
  on public.packages for update
  using (public.is_editor());

create policy "packages: editor delete"
  on public.packages for delete
  using (public.is_editor());

-- ─── site_content ────────────────────────────────────────────
-- Editor puede actualizar, no insertar/eliminar (las claves las gestiona admin)
drop policy if exists "site_content: admin update" on public.site_content;

create policy "site_content: editor update"
  on public.site_content for update
  using (public.is_editor());

-- ─── Storage: gallery ────────────────────────────────────────
drop policy if exists "gallery: admin insert" on storage.objects;
drop policy if exists "gallery: admin update" on storage.objects;
drop policy if exists "gallery: admin delete" on storage.objects;

create policy "gallery: editor insert"
  on storage.objects for insert
  with check (bucket_id = 'gallery' and public.is_editor());

create policy "gallery: editor update"
  on storage.objects for update
  using (bucket_id = 'gallery' and public.is_editor());

create policy "gallery: editor delete"
  on storage.objects for delete
  using (bucket_id = 'gallery' and public.is_editor());

-- ─── Storage: videos ─────────────────────────────────────────
drop policy if exists "videos: admin insert" on storage.objects;
drop policy if exists "videos: admin update" on storage.objects;
drop policy if exists "videos: admin delete" on storage.objects;

create policy "videos: editor insert"
  on storage.objects for insert
  with check (bucket_id = 'videos' and public.is_editor());

create policy "videos: editor update"
  on storage.objects for update
  using (bucket_id = 'videos' and public.is_editor());

create policy "videos: editor delete"
  on storage.objects for delete
  using (bucket_id = 'videos' and public.is_editor());
