-- SafeMum registration trigger migration.
-- Run this in Supabase SQL Editor after public.profiles and public.app_role exist.
-- It is safe to run repeatedly.

alter table public.profiles
  add column if not exists phone varchar(30);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, role, phone)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'User'),
    new.email,
    'user'::public.app_role,
    nullif(trim(new.raw_user_meta_data ->> 'phone'), '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();
