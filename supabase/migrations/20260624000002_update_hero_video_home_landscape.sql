-- Actualiza la URL del video hero del Home al formato horizontal (landscape).
update public.hero_videos
set
  url        = 'https://oewqyckeqolrpjbjevap.supabase.co/storage/v1/object/public/videos/Home/home_landscape.mp4',
  updated_at = now()
where event_type is null
  and is_active = true;
