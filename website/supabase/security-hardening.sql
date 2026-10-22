-- Apply this migration to an existing FoodieFly Supabase project after reviewing
-- existing delivery roles. It is safe to re-run.
--
-- Review current privileged accounts before applying:
-- select id, full_name, created_at from public.profiles where role = 'delivery';
-- Do not automatically demote known legitimate drivers; investigate unexpected roles.

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

drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change
  before update of role on public.profiles
  for each row execute function public.prevent_profile_role_change();

revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

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

drop policy if exists "Customers create their own orders" on public.orders;
drop policy if exists "Customers create their own pending orders" on public.orders;
create policy "Customers create their own pending orders"
  on public.orders for insert
  with check (
    (select auth.uid()) = customer_id
    and driver_id is null
    and status = 'pending'
    and total = 0
  );

drop policy if exists "Customers cancel their own pending orders" on public.orders;
create policy "Customers cancel their own pending orders"
  on public.orders for delete
  using ((select auth.uid()) = customer_id and status = 'pending');
grant delete on public.orders to authenticated;

drop policy if exists "Drivers accept and update their orders" on public.orders;
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

drop policy if exists "Customers add their own order items" on public.order_items;
drop policy if exists "Customers add items to their own pending orders" on public.order_items;
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

drop trigger if exists initialize_order_total on public.orders;
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

drop trigger if exists recalculate_order_total on public.order_items;
create trigger recalculate_order_total
  after insert or update or delete on public.order_items
  for each row execute function public.recalculate_order_total();

create or replace function public.guard_delivery_status_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null then return new; end if;

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

drop trigger if exists guard_delivery_status_transition on public.orders;
create trigger guard_delivery_status_transition
  before update on public.orders
  for each row execute function public.guard_delivery_status_transition();

revoke update on public.orders from authenticated;
grant update (status, driver_id) on public.orders to authenticated;

-- IMPORTANT: this demo still accepts unit_price from the browser. Before taking
-- real payments, move the product catalog into the database and derive line
-- prices from trusted product IDs instead of trusting client-submitted prices.
