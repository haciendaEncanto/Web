-- Módulo de documentos y pagos del portal
-- ============================================================

-- payments.status: falta un estado pendiente/confirmado para el flujo de
-- "el planner registra el pago -> el cliente sube comprobante -> el planner
-- confirma". Antes payments no tenía ningún campo de estado.
create type public.payment_status as enum ('pending', 'confirmed');

alter table public.payments
  add column if not exists status public.payment_status not null default 'pending';

-- El formulario "Registrar pago" del planner ofrece efectivo/transferencia/
-- tarjeta; el enum existente (transferencia, efectivo, cheque, otro) no
-- incluía tarjeta.
alter type public.payment_method_type add value if not exists 'tarjeta';
