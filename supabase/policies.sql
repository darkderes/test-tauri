-- Complemento de supabase/setup-profiles.sql (RLS y bucket ya aplicados allí).
-- Ejecutar en Supabase Dashboard > SQL Editor.

-- updated_at fiable, calculado en el servidor: sobreescribe el valor
-- que envíe el cliente en cada insert/update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before insert or update on public.profiles
  for each row execute function public.set_updated_at();
