-- Run after schema.sql in the Supabase SQL Editor.
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
  total numeric(10,2) not null default 0 check (total >= 0),
  status text not null default 'pending'
    check (status in ('pending', 'accepted', 'picked_up', 'on_the_way', 'delivered')),
  created_at timestamptz not null default now()
);

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders(id) on delete cascade,
  product_name text not null,
  unit_price numeric(10,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0)
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create or replace function public.is_delivery_driver()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'delivery'
  )
$$;

revoke all on function public.is_delivery_driver() from public;
grant execute on function public.is_delivery_driver() to authenticated;

create policy "Customers create their own pending orders"
  on public.orders for insert
  with check (
    (select auth.uid()) = customer_id
    and driver_id is null
    and status = 'pending'
    and total = 0
  );

create policy "Customers view their own orders"
  on public.orders for select
  using ((select auth.uid()) = customer_id);

create policy "Drivers view available or assigned orders"
  on public.orders for select
  using (
    public.is_delivery_driver()
    and (status = 'pending' or driver_id = (select auth.uid()))
  );

create policy "Drivers accept and update their orders"
  on public.orders for update
  using (
    public.is_delivery_driver()
    and (status = 'pending' or driver_id = (select auth.uid()))
  )
  with check (
    public.is_delivery_driver()
    and driver_id = (select auth.uid())
  );

create policy "Customers add items to their own pending orders"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.customer_id = (select auth.uid())
        and orders.status = 'pending'
    )
  );

create policy "Customers and drivers view permitted order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and (
          orders.customer_id = (select auth.uid())
          or (
            public.is_delivery_driver()
            and (orders.status = 'pending' or orders.driver_id = (select auth.uid()))
          )
        )
    )
  );

-- Clients may update only the two fields needed by the delivery workflow.
revoke update on public.orders from authenticated;
grant update (status, driver_id) on public.orders to authenticated;

-- Always initialize the total to zero. The database recalculates it from order
-- items, so the client-supplied total is never trusted.
create or replace function public.initialize_order_total()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.total := 0;
  new.status := 'pending';
  new.driver_id := null;
  return new;
end;
$$;

create trigger initialize_order_total
  before insert on public.orders
  for each row execute function public.initialize_order_total();

create or replace function public.recalculate_order_total()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_order_id uuid;
begin
  if tg_op = 'DELETE' then
    affected_order_id := old.order_id;
  else
    affected_order_id := new.order_id;
  end if;

  update public.orders
  set total = coalesce((
    select sum(item.unit_price * item.quantity)
    from public.order_items as item
    where item.order_id = affected_order_id
  ), 0)
  where id = affected_order_id;

  if tg_op = 'UPDATE' and old.order_id is distinct from new.order_id then
    update public.orders
    set total = coalesce((
      select sum(item.unit_price * item.quantity)
      from public.order_items as item
      where item.order_id = old.order_id
    ), 0)
    where id = old.order_id;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger recalculate_order_total
  after insert or update or delete on public.order_items
  for each row execute function public.recalculate_order_total();

-- Enforce the same order-status sequence even if a client skips the UI.
create or replace function public.guard_delivery_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if new.status is not distinct from old.status
     and new.driver_id is not distinct from old.driver_id then
    return new;
  end if;

  if not public.is_delivery_driver() then
    raise exception 'Only delivery drivers can update delivery status';
  end if;

  if old.status = 'pending' then
    if new.status <> 'accepted' or new.driver_id is distinct from auth.uid() then
      raise exception 'A pending order can only be accepted by assigning it to yourself';
    end if;
  elsif old.driver_id is distinct from auth.uid() then
    raise exception 'You can only update orders assigned to you';
  elsif old.status = 'accepted' and new.status = 'picked_up' then
    null;
  elsif old.status = 'picked_up' and new.status = 'on_the_way' then
    null;
  elsif old.status = 'on_the_way' and new.status = 'delivered' then
    null;
  else
    raise exception 'Invalid delivery status transition';
  end if;

  return new;
end;
$$;

create trigger guard_delivery_status_transition
  before update on public.orders
  for each row execute function public.guard_delivery_status_transition();
