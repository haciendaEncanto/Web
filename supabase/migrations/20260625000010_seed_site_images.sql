-- ============================================================
-- Hacienda El Encanto — Seed: claves de imágenes editables del Home
-- (cards de eventos, imagen Nosotros, cards de servicios)
-- ============================================================

insert into public.site_content (key, title, content, data)
values
  ('img_card_boda',           'Imagen — Card Bodas',                 null, '{}'),
  ('img_card_quince',         'Imagen — Card Quince Años',            null, '{}'),
  ('img_card_empresarial',    'Imagen — Card Empresariales',          null, '{}'),
  ('img_card_revelacion',     'Imagen — Card Revelación de Género',   null, '{}'),
  ('img_nosotros',            'Imagen — Sección Nosotros',            null, '{}'),
  ('img_servicio_catering',      'Imagen — Servicio Catering',           null, '{}'),
  ('img_servicio_fotografia',    'Imagen — Servicio Fotografía y Video', null, '{}'),
  ('img_servicio_decoracion',    'Imagen — Servicio Decoración',         null, '{}')
on conflict (key) do nothing;
