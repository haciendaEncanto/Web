-- ============================================================
-- payments: receipt_url para comprobante de pago (PDF)
-- Flujo manual: cliente sube PDF desde el portal → admin confirma.
-- No hay pasarela de pagos.
-- ============================================================

alter table public.payments
  add column if not exists receipt_url text;

-- El cliente puede actualizar receipt_url en pagos de sus propias reservas.
-- La restricción de columna (solo receipt_url) se garantiza en la Server Action.
create policy "payments: client update receipt_url"
  on public.payments for update
  using (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.bookings b
      where b.id = booking_id and b.client_id = auth.uid()
    )
  );

-- ============================================================
-- Storage: cliente puede subir comprobantes a documents/{booking_id}/
-- ============================================================

create policy "documents: client insert receipt"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and exists (
      select 1 from public.bookings b
      where b.id::text = (string_to_array(name, '/'))[1]
        and b.client_id = auth.uid()
    )
  );

create policy "documents: client update receipt"
  on storage.objects for update
  using (
    bucket_id = 'documents'
    and exists (
      select 1 from public.bookings b
      where b.id::text = (string_to_array(name, '/'))[1]
        and b.client_id = auth.uid()
    )
  );
