create type public.user_role as enum ('customer', 'delivery');
create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, role public.user_role not null default 'customer', created_at timestamptz not null default now());
alter table public.profiles enable row level security;
create policy "Users can view their own profile" on public.profiles for select using ((select auth.uid()) = id);
create policy "Users can update their own profile" on public.profiles for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = '' as $$ begin insert into public.profiles (id, full_name, role) values (new.id, new.raw_user_meta_data ->> 'full_name', coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'customer')); return new; end; $$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();