-- ============================================================
-- Hacienda El Encanto — Seed: contenido del Home
-- ============================================================

insert into public.site_content (key, title, content, data)
values
  (
    'hero',
    'El lugar donde tus sueños se celebran',
    'Rodeados de naturaleza y elegancia, creamos experiencias únicas para los momentos más importantes de tu vida.',
    '{}'
  ),
  (
    'about',
    'Nosotros',
    'En Hacienda El Encanto creemos que cada celebración es irrepetible. Por eso, no solo ofrecemos un espacio — creamos experiencias completas donde cada detalle está pensado para que tú y tus invitados vivan momentos extraordinarios. Ubicados en la Vía Suba Km 5.5, en Cota, Cundinamarca, nuestro espacio combina la calidez de la naturaleza con la sofisticación que tu evento merece. Con capacidad para más de 300 invitados, somos el escenario ideal para hacer realidad tu visión.',
    '{}'
  ),
  (
    'stats',
    'Estadísticas',
    null,
    '[
      {"value": "+300", "label": "Invitados"},
      {"value": "+150", "label": "Eventos realizados"},
      {"value": "100%",  "label": "Acompañamiento"}
    ]'::jsonb
  ),
  (
    'contact',
    'Contacto',
    null,
    '{
      "whatsapp":  "+57 324 783 6852",
      "email":     "contacto@hacienda-encanto.com",
      "address":   "Vía Suba Km 5.5, Cota, Cundinamarca, Colombia",
      "instagram": "@haciendaelencanto"
    }'::jsonb
  )
on conflict (key) do update
  set title      = excluded.title,
      content    = excluded.content,
      data       = excluded.data,
      updated_at = now();
