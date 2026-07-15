-- Foto del cliente en el testimonio (bucket "gallery", carpeta avatars/)
alter table public.testimonials
  add column if not exists photo_url text null;
