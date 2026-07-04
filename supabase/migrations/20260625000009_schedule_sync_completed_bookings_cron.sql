-- Programa la ejecución diaria de sync_completed_bookings() vía pg_cron.
-- Migración separada de la función a propósito: si pg_cron no está disponible
-- en el proyecto (permiso/plan), esta migración puede fallar sin afectar la
-- función en sí, que ya se invoca de forma oportunista desde la app
-- (ver src/lib/clientes.ts) cada vez que se listan clientes.

create extension if not exists pg_cron;

select cron.schedule(
  'sync-completed-bookings',
  '0 5 * * *',
  $$select public.sync_completed_bookings();$$
);
