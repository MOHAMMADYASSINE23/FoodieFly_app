-- Run this after schema.sql in Supabase SQL Editor.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id),
  driver_id uuid references public.profiles(id),
  store text not null,
  category text not null,
  delivery_address text not null,
  phone text not null,
  customer_note text,
  location_lat double precision,
  location_lng double precision,
  total numeric(10,2) not null check (total >= 0),
  status text not null default 'pending' check (status in ('pending','accepted','picked_up','on_the_way','delivered')),
  created_at timestamptz not null default now()
);
create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_name text not null,
  unit_price numeric(10,2) not null,
  quantity integer not null check (quantity > 0)
);
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
create function public.is_delivery_driver() returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.profiles where id = auth.uid() and role = 'delivery') $$;
create policy "Customers create their own orders" on public.orders for insert with check ((select auth.uid()) = customer_id and driver_id is null and status = 'pending');
create policy "Customers view their own orders" on public.orders for select using ((select auth.uid()) = customer_id);
create policy "Drivers view available or assigned orders" on public.orders for select using (public.is_delivery_driver() and (status = 'pending' or driver_id = (select auth.uid())));
create policy "Drivers accept and update their orders" on public.orders for update using (public.is_delivery_driver() and (status = 'pending' or driver_id = (select auth.uid()))) with check (public.is_delivery_driver() and driver_id = (select auth.uid()));
create policy "Customers add their own order items" on public.order_items for insert with check (exists (select 1 from public.orders where orders.id = order_items.order_id and orders.customer_id = (select auth.uid())));
create policy "Customers and assigned drivers view order items" on public.order_items for select using (exists (select 1 from public.orders where orders.id = order_items.order_id and (orders.customer_id = (select auth.uid()) or (public.is_delivery_driver() and (orders.status = 'pending' or orders.driver_id = (select auth.uid()))))));