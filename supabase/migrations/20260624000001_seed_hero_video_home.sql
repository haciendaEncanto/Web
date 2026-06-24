-- Inserta el video principal del Hero Home en Supabase Storage.
-- event_type NULL indica que pertenece al Home (no a una página de evento).
insert into public.hero_videos (url, title, event_type, is_active, sort_order)
values (
  'https://oewqyckeqolrpjbjevap.supabase.co/storage/v1/object/public/videos/Home/home.mp4',
  'Hero Home',
  null,
  true,
  1
)
on conflict do nothing;
