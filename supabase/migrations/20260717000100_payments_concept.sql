-- El formulario "Registrar pago" separa concepto de notas; payments solo
-- tenía "notes" (para observaciones libres) y no un campo de concepto.
alter table public.payments
  add column if not exists concept text null;
