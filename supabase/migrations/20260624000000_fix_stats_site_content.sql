-- Corrige el orden de las estadísticas en site_content:
-- +300 → Eventos realizados, +150 → Invitados, 100% → Acompañamiento
update public.site_content
set
  data       = '[
    {"value": "+300", "label": "Eventos realizados"},
    {"value": "+150", "label": "Invitados"},
    {"value": "100%", "label": "Acompañamiento"}
  ]'::jsonb,
  updated_at = now()
where key = 'stats';
