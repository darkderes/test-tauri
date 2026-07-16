-- Políticas de seguridad recomendadas para Supabase.
-- Ejecutar/verificar en el SQL Editor del proyecto Supabase.
-- La app cliente usa la anon key embebida en el instalador: TODA la
-- seguridad depende de que estas políticas (RLS) estén activas.

-- ============================================================
-- Tabla: profiles
-- ============================================================

alter table public.profiles enable row level security;

-- Cada usuario solo puede leer su propia fila.
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- Cada usuario solo puede insertar su propia fila.
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Cada usuario solo puede actualizar su propia fila.
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- updated_at fiable, calculado en el servidor (el valor del cliente
-- queda sobreescrito; el cliente puede dejar de enviarlo cuando este
-- trigger esté aplicado).
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

-- ============================================================
-- Storage: bucket "avatars"
-- ============================================================
-- El bucket es público para lectura (la app muestra avatares vía
-- getPublicUrl). La escritura debe quedar limitada a la carpeta
-- propia del usuario: <user_id>/...

-- Subir solo dentro de la carpeta propia.
drop policy if exists "avatars_insert_own_folder" on storage.objects;
create policy "avatars_insert_own_folder"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Sobrescribir (upsert) solo dentro de la carpeta propia.
drop policy if exists "avatars_update_own_folder" on storage.objects;
create policy "avatars_update_own_folder"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Borrar solo dentro de la carpeta propia.
drop policy if exists "avatars_delete_own_folder" on storage.objects;
create policy "avatars_delete_own_folder"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Lectura pública de avatares (necesaria para getPublicUrl).
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');
