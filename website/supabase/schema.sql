create type public.user_role as enum ('customer', 'delivery');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- A new signup must never be able to grant itself delivery privileges through
-- user-editable Auth metadata. Delivery roles are assigned by an administrator.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, new.raw_user_meta_data ->> 'full_name', 'customer');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Defense in depth: authenticated clients may edit names, never account roles.
create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and auth.uid() is not null then
    raise exception 'Account roles can only be changed by an administrator';
  end if;
  return new;
end;
$$;

create trigger prevent_profile_role_change
  before update of role on public.profiles
  for each row execute function public.prevent_profile_role_change();

revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;
