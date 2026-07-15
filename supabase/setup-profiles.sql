-- Ejecutar en Supabase Dashboard > SQL Editor

-- 1. Tabla de perfiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  phone text,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Ver perfil propio"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Insertar perfil propio"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Actualizar perfil propio"
  on public.profiles for update
  using (auth.uid() = id);

-- 2. Crear perfil automáticamente al registrarse
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Crear perfiles para usuarios ya existentes
insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- 3. Bucket de avatares (lectura pública)
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true);

create policy "Avatares lectura publica"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Subir avatar propio"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Actualizar avatar propio"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Borrar avatar propio"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
