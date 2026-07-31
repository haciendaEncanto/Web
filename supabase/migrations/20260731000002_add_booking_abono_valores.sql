-- Agregar columnas de monto para el segundo y tercer abono del evento.
-- Las fechas ya existen; ahora se añaden los valores correspondientes.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS valor_segundo_abono numeric,
  ADD COLUMN IF NOT EXISTS valor_tercer_abono  numeric;
