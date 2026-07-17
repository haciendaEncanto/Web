-- ============================================================
-- Hacienda El Encanto — Elimina packages.price (nunca usada)
-- Hallazgo QA (PB-01-09): el campo price era legible por cualquiera
-- vía la API REST publica de Supabase (anon key + select=*) pese a que
-- la UI nunca lo muestra. Confirmado que ningun codigo en src/ lee o
-- escribe packages.price (siempre quedo en 0, decision de negocio:
-- "Sin precios publicos"). Se elimina la columna en vez de intentar
-- restringirla via RLS (Postgres RLS es a nivel de fila, no de
-- columna) — asi se cierra el vector de exposicion por completo.
-- ============================================================

alter table public.packages
  drop column if exists price;
