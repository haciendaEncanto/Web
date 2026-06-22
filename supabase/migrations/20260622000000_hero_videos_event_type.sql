-- Agrega event_type a hero_videos para que cada página de evento
-- pueda tener su propio video gestionable desde el admin.
-- NULL = home general; valores: boda, quince, empresarial, revelacion
ALTER TABLE hero_videos
  ADD COLUMN IF NOT EXISTS event_type text NULL;
