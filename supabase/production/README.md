# Supabase Production Database Setup

This directory contains the consolidated, production-ready PostgreSQL schema for Supabase, integrating all refinements, safety triggers, performance indexes, and security policies from **Phases 1 through 9**.

---

## 📁 Directory Structure

| File | Purpose |
| :--- | :--- |
| **`00_full_schema.sql`** | **Master One-Click Deployment Script**. Contains the entire unified schema in strict dependency order. |
| **`01_foundation_and_auth.sql`** | Timestamp triggers, `is_admin()` security helper, order number sequence generator, and `auth.users` provisioning triggers. |
| **`02_catalog.sql`** | `categories`, `brands`, `products`, `product_variants`, `product_images`, tsvector search, default variant/primary image triggers, and RLS. |
| **`03_inventory.sql`** | `inventory`, `inventory_movements` (append-only ledger), concurrency locks (`FOR UPDATE`), direct edit prevention, and `product_stock_status` public view. |
| **`04_shopping.sql`** | `addresses`, `carts`, `cart_items`, `wishlists`, `wishlist_items`, single default address/wishlist triggers, and RLS. |
| **`05_orders.sql`** | `orders`, `order_items`, `order_status_history`, lifecycle triggers (status transitions, stock reservation holds, sale movement), and the atomic `create_order()` RPC. |

---

## 🚀 How to Deploy to Supabase Production

### Option A: Complete Setup (Recommended)
1. Open your **Supabase Dashboard** > **SQL Editor**.
2. Copy and paste the entire contents of [00_full_schema.sql](file:///c:/Users/darsh/OneDrive/Pictures/Documents/code/personal/website/supabase/production/00_full_schema.sql).
3. Click **Run**.

### Option B: Step-by-Step Modular Execution
Execute the files in exact numeric sequence:
1. [01_foundation_and_auth.sql](file:///c:/Users/darsh/OneDrive/Pictures/Documents/code/personal/website/supabase/production/01_foundation_and_auth.sql)
2. [02_catalog.sql](file:///c:/Users/darsh/OneDrive/Pictures/Documents/code/personal/website/supabase/production/02_catalog.sql)
3. [03_inventory.sql](file:///c:/Users/darsh/OneDrive/Pictures/Documents/code/personal/website/supabase/production/03_inventory.sql)
4. [04_shopping.sql](file:///c:/Users/darsh/OneDrive/Pictures/Documents/code/personal/website/supabase/production/04_shopping.sql)
5. [05_orders.sql](file:///c:/Users/darsh/OneDrive/Pictures/Documents/code/personal/website/supabase/production/05_orders.sql)

---

## 🛡️ Architecture & Design Decisions

### 1. Zero-Table User Identity & Secure RBAC
* **No `public.profiles` table:** Personal details (`first_name`, `last_name`, `phone`) are stored directly on `auth.users.raw_user_meta_data`.
* **Tamper-Proof Admin Roles:** Role is stored in `auth.users.raw_app_meta_data ->> 'role'` (`customer` \| `admin`). Because `raw_app_meta_data` cannot be modified by client-side `updateUser()` requests, privilege escalation is impossible.
* **Foreign Keys:** Tables (`addresses`, `carts`, `wishlists`, `orders`) point directly to `auth.users(id)`.

### 2. URL-Safe UUIDs (`public_id`)
* `products`, `product_variants`, `categories`, `brands`, `orders`, and `addresses` have unique `public_id uuid default gen_random_uuid()`.
* Internal joins utilize high-performance `bigint` keys, while external API endpoints and frontend URLs use non-sequential, tamper-proof UUIDs.

### 3. Concurrency-Safe Stock & Append-Only Ledger
* Direct modifications to `inventory.quantity` are blocked by `prevent_direct_quantity_change`.
* Stock changes must be made via `inventory_movements`, which locks rows (`FOR UPDATE`) and prevents negative inventory.
* Public visitors view stock availability through `product_stock_status` without exposing warehouse reorder thresholds or reserved counts.

### 4. Atomic Order Placement & Lifecycle
* Orders are created strictly via `create_order(p_address_id, p_customer_note)`:
  1. Verifies cart items and calculates totals server-side (preventing price tampering).
  2. Freezes snapshot pricing, SKUs, product names, and address info in `order_items` and `orders.shipping_address`.
  3. Increments `reserved_quantity` on `inventory`.
* Changing order status triggers automated actions:
  * `confirmed`: Empties the user's active cart.
  * `shipped`: Converts reservations into permanent `sale` inventory movements.
  * `cancelled`: Releases reserved inventory back to available stock.

### 5. High-Performance RLS Policies
* All `auth.uid()` and `public.is_admin()` policy calls are wrapped in `(select ...)` so PostgreSQL initializes the value once per query rather than recalculating per row.

---

## 👑 Granting Admin Role to a User

To assign admin privileges to a user in Supabase, execute this in the SQL Editor:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"role": "admin"}'::jsonb
where email = 'your-admin-email@example.com';
```
