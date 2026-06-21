-- ============================================================
-- Hacienda El Encanto — Seed: espacio principal
-- ============================================================

insert into public.spaces (name, slug, description, capacity_min, capacity_max, amenities, is_active, sort_order)
values (
  'Salón Principal',
  'salon-principal',
  'Un espacio imponente rodeado de jardines y naturaleza abierta, donde la elegancia y la calidez del campo se fusionan para crear el escenario perfecto. Amplias zonas verdes, iluminación de ambiente y acabados que equilibran lo rústico y lo sofisticado hacen del Salón Principal el lugar ideal para bodas, celebraciones y eventos corporativos de hasta 300 invitados.',
  50,
  300,
  '["Jardines y zonas verdes", "Iluminación de ambiente", "Parqueadero", "Baños para invitados", "Área de cocina", "Terraza exterior"]'::jsonb,
  true,
  1
)
on conflict (slug) do nothing;
