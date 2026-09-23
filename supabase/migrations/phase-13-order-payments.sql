-- ============================================================================
-- PHASE 13: ORDER PAYMENT TRACKING & CHECKOUT RLS
-- ============================================================================
-- Extends public.orders to support payment gateway transaction attributes and
-- grants authenticated customers secure permission to insert orders & items.
-- ============================================================================

-- 1. Add payment tracking columns to public.orders
alter table public.orders
  add column if not exists payment_method text not null default 'cod'
    check (payment_method in ('razorpay', 'cod')),
  add column if not exists payment_id text,
  add column if not exists payment_status text not null default 'pending'
    check (payment_status in ('pending', 'paid', 'failed', 'refunded'));

create index if not exists idx_orders_payment_id
  on public.orders (payment_id)
  where payment_id is not null;

create index if not exists idx_orders_payment_method
  on public.orders (payment_method);

create index if not exists idx_orders_payment_status
  on public.orders (payment_status);

comment on column public.orders.payment_method is 'Payment method used for the order: razorpay, cod';
comment on column public.orders.payment_id is 'Gateway transaction reference ID (e.g. Razorpay payment ID)';
comment on column public.orders.payment_status is 'Payment state: pending, paid, failed, refunded';

-- 2. Customer RLS policies for placing orders directly from authenticated sessions
drop policy if exists "orders_insert_own" on public.orders;
create policy "orders_insert_own" on public.orders
  for insert with check (user_id = (select auth.uid()));

drop policy if exists "order_items_insert_own" on public.order_items;
create policy "order_items_insert_own" on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.user_id = (select auth.uid())
    )
  );

-- 3. Prevent tampering with payment details on customer updates
create or replace function public.restrict_customer_order_update()
returns trigger
language plpgsql
as $$
begin
  -- Admins have full update permissions
  if public.is_admin() then
    return new;
  end if;

  -- Customers can only cancel pending or confirmed orders
  if new.status is distinct from old.status then
    if new.status <> 'cancelled' or old.status not in ('pending', 'confirmed') then
      raise exception 'You can only cancel an order while it is pending or confirmed';
    end if;
  end if;

  -- Customers cannot alter amounts, addresses, identifiers, or payment details
  if new.subtotal is distinct from old.subtotal
     or new.shipping_amount is distinct from old.shipping_amount
     or new.discount_amount is distinct from old.discount_amount
     or new.tax_amount is distinct from old.tax_amount
     or new.total_amount is distinct from old.total_amount
     or new.shipping_address is distinct from old.shipping_address
     or new.user_id is distinct from old.user_id
     or new.order_number is distinct from old.order_number
     or new.payment_method is distinct from old.payment_method
     or new.payment_id is distinct from old.payment_id
     or new.payment_status is distinct from old.payment_status
  then
    raise exception 'You are not allowed to modify this field on an order';
  end if;

  return new;
end;
$$;

-- 4. Initial status trigger: clean cart on instant confirmed orders (e.g. online payments)
create or replace function public.log_initial_order_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.order_status_history (order_id, status, changed_by)
  values (new.id, new.status, new.user_id);

  if new.status = 'confirmed' then
    delete from public.cart_items
    where cart_id = (
      select id from public.carts where user_id = new.user_id
    );
  end if;

  return new;
end;
$$;

-- 5. Safely reserve inventory when variant_id is present
create or replace function public.reserve_inventory_for_order_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_available integer;
begin
  if new.variant_id is not null then
    select available_quantity into v_available
    from public.inventory
    where variant_id = new.variant_id
    for update;

    if v_available is null or v_available < new.quantity then
      raise exception 'Insufficient stock for variant % (available %, requested %)',
        new.variant_id, coalesce(v_available, 0), new.quantity;
    end if;

    update public.inventory
    set reserved_quantity = reserved_quantity + new.quantity
    where variant_id = new.variant_id;
  end if;

  return new;
end;
$$;

-- 6. Reload schema cache for PostgREST
notify pgrst, 'reload schema';
