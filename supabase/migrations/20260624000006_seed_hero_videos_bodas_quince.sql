insert into public.hero_videos (url, title, event_type, is_active, sort_order)
values
  (
    'https://oewqyckeqolrpjbjevap.supabase.co/storage/v1/object/public/videos/Bodas/Bodas.mp4',
    'Hero Bodas',
    'boda',
    true,
    1
  ),
  (
    'https://oewqyckeqolrpjbjevap.supabase.co/storage/v1/object/public/videos/Quince/Quinces.mp4',
    'Hero Quince Años',
    'quince',
    true,
    1
  )
on conflict do nothing;
