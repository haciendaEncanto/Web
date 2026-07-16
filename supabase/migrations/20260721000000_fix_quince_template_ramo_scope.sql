-- ============================================================
-- Hacienda El Encanto — Ramo deja de ser universal
-- 'Ramo' vivía en la sección universal 'Menú y Bebidas' (event_type='all'),
-- por lo que aparecía también en quinceañera/empresarial/revelación.
-- Se mueve a un ítem exclusivo de event_type='boda' en la misma sección
-- y posición (item_sort=3), así el resto de tipos de evento ya no lo ven.
-- No afecta órdenes ya inicializadas (solo cambia la plantilla fuente).
-- ============================================================

delete from public.service_order_templates
where event_type = 'all'
  and section_name = 'Menú y Bebidas'
  and item_label = 'Ramo';

insert into public.service_order_templates
  (event_type, section_name, section_sort, item_label, item_type, options, item_sort, filled_by, notes)
values
  ('boda', 'Menú y Bebidas', 2, 'Ramo', 'text', '[]', 3, 'planner', null);
