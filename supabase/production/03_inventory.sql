-- ============================================================================
-- 03. INVENTORY SCHEMA
-- inventory, inventory_movements, product_stock_status view
-- ============================================================================
-- Description:
--   Robust inventory ledger and physical stock tracking system.
--
-- Core Principles:
--   - Append-only stock movements: `inventory.quantity` is never directly edited;
--     it is maintained via the `inventory_movements` ledger with row-level locks
--     to completely eliminate overselling and race conditions.
--   - Every new variant created automatically gets a matching tracking row in
--     `inventory` with 0 initial stock.
--   - Public storefronts read stock availability through the `product_stock_status`
--     view, hiding internal warehouse metrics (low stock threshold, reserved count).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. inventory
-- ----------------------------------------------------------------------------
create table if not exists public.inventory (
  variant_id bigint primary key
    references public.product_variants(id) on delete cascade,

  quantity integer not null default 0,
  reserved_quantity integer not null default 0,

  available_quantity integer generated always as (quantity - reserved_quantity) stored,

  low_stock_threshold integer not null default 5,

  updated_at timestamptz not null default now(),

  check (quantity >= 0),
  check (reserved_quantity >= 0),
  check (reserved_quantity <= quantity)
);

comment on table public.inventory is 'Physical stock cache. Direct updates blocked — apply movements via inventory_movements.';
comment on column public.inventory.quantity is 'Physical stock on hand. Maintained only by inventory_movements.';
comment on column public.inventory.reserved_quantity is 'Quantity allocated to pending/processing orders; not yet shipped.';
comment on column public.inventory.available_quantity is 'Calculated available stock (quantity - reserved_quantity).';

drop trigger if exists set_inventory_updated_at on public.inventory;
create trigger set_inventory_updated_at
  before update on public.inventory
  for each row
  execute function public.set_updated_at();

create index if not exists idx_inventory_available_quantity on public.inventory(available_quantity);

-- Block direct edits to inventory.quantity outside of movement triggers
create or replace function public.prevent_direct_quantity_change()
returns trigger
language plpgsql
as $$
begin
  if new.quantity is distinct from old.quantity and pg_trigger_depth() <= 1 then
    raise exception 'inventory.quantity cannot be changed directly — insert a row into inventory_movements instead';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_direct_quantity_change on public.inventory;
create trigger trg_prevent_direct_quantity_change
  before update of quantity on public.inventory
  for each row
  execute function public.prevent_direct_quantity_change();

-- Auto-provision an inventory row whenever a product variant is created
create or replace function public.create_inventory_row_for_variant()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.inventory (variant_id) values (new.id)
  on conflict (variant_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_create_inventory_for_variant on public.product_variants;
create trigger trg_create_inventory_for_variant
  after insert on public.product_variants
  for each row
  execute function public.create_inventory_row_for_variant();

-- ----------------------------------------------------------------------------
-- 2. inventory_movements
-- ----------------------------------------------------------------------------
create table if not exists public.inventory_movements (
  id bigint generated always as identity primary key,

  variant_id bigint not null references public.product_variants(id),
  -- No cascade delete: variants with movement history must be archived, not deleted

  quantity_change integer not null check (quantity_change <> 0),

  movement_type text not null check (
    movement_type in ('purchase', 'sale', 'return', 'damaged', 'restock', 'adjustment')
  ),
  -- purchase   = stock received from supplier
  -- sale       = decremented because an order shipped
  -- return     = customer return
  -- damaged    = write-off (breakage, defective)
  -- restock    = manual restock
  -- adjustment = manual audit correction

  reference_type text check (reference_type in ('order', 'purchase_order', 'manual', 'other')),
  reference_id bigint,

  note text,

  created_by uuid references auth.users(id) default auth.uid(),

  created_at timestamptz not null default now()
);

comment on table public.inventory_movements is 'Append-only stock ledger — immutable audit trail for all stock transitions.';

create index if not exists idx_inventory_movements_variant_id on public.inventory_movements(variant_id);
create index if not exists idx_inventory_movements_type on public.inventory_movements(movement_type);
create index if not exists idx_inventory_movements_created_at on public.inventory_movements(created_at desc);
create index if not exists idx_inventory_movements_reference on public.inventory_movements(reference_type, reference_id);

-- Apply inventory movement with row-level locking (FOR UPDATE)
create or replace function public.apply_inventory_movement()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_qty integer;
begin
  select quantity into current_qty
  from public.inventory
  where variant_id = new.variant_id
  for update;

  if current_qty is null then
    if new.quantity_change < 0 then
      raise exception 'Cannot create negative inventory for variant %', new.variant_id;
    end if;
    insert into public.inventory (variant_id, quantity)
    values (new.variant_id, new.quantity_change);
  else
    if current_qty + new.quantity_change < 0 then
      raise exception 'Insufficient stock for variant % (have %, requested change %)',
        new.variant_id, current_qty, new.quantity_change;
    end if;
    update public.inventory
    set quantity = current_qty + new.quantity_change
    where variant_id = new.variant_id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_apply_inventory_movement on public.inventory_movements;
create trigger trg_apply_inventory_movement
  after insert on public.inventory_movements
  for each row
  execute function public.apply_inventory_movement();

-- ============================================================================
-- 3. Row Level Security (Inventory)
-- ============================================================================
alter table public.inventory enable row level security;
alter table public.inventory_movements enable row level security;

-- inventory (admin only; public uses product_stock_status view)
create policy "inventory_select_admin"
  on public.inventory for select
  using ((select public.is_admin()));

create policy "inventory_update_admin"
  on public.inventory for update
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

-- inventory_movements (admin append & read only; no update/delete for anyone)
create policy "inventory_movements_select_admin"
  on public.inventory_movements for select
  using ((select public.is_admin()));

create policy "inventory_movements_insert_admin"
  on public.inventory_movements for insert
  with check ((select public.is_admin()));

-- ----------------------------------------------------------------------------
-- 4. Public Stock Status View
-- ----------------------------------------------------------------------------
-- Note: Intentionally created without security_invoker so that storefront
-- users (anon & authenticated) can query stock availability without direct
-- access to internal inventory tables.
create or replace view public.product_stock_status as
select
  i.variant_id,
  i.available_quantity
from public.inventory i
join public.product_variants v on v.id = i.variant_id
join public.products p on p.id = v.product_id
where v.is_active = true
  and p.status = 'active';

grant select on public.product_stock_status to anon, authenticated;
