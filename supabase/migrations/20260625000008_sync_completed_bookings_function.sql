-- Marca como 'completed' los bookings cuya fecha de evento ya pasó.
-- security definer: cualquier usuario autenticado (planner/admin) puede invocarla
-- vía RPC como chequeo oportunista, sin depender exclusivamente del cron.

create or replace function public.sync_completed_bookings()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.bookings
  set status = 'completed'
  where status in ('pending', 'confirmed')
    and event_date < current_date;
end;
$$;

grant execute on function public.sync_completed_bookings() to authenticated;
