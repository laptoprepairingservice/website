# Supabase Product Assets & Storage Setup Guide

This guide walks you through setting up Supabase Storage for product assets (Banner images, gallery photos, and demonstration videos).

---

## 1. Apply the Database Migration

Run migration [`phase-10.sql`](file:///c:/Users/darsh/OneDrive/Pictures/Documents/code/personal/website/supabase/migrations/phase-10.sql). You can apply it using either the **Supabase CLI** or the **Supabase Dashboard SQL Editor**.

### Method A: Supabase Dashboard SQL Editor (Recommended for Hosted Supabase)
1. Navigate to your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** tab from the left sidebar.
3. Click **New Query**.
4. Open [`supabase/migrations/phase-10.sql`](file:///c:/Users/darsh/OneDrive/Pictures/Documents/code/personal/website/supabase/migrations/phase-10.sql), copy the entire SQL script, paste it into the editor, and click **Run**.
5. Ensure the query executes with `Success. No rows returned`.

### Method B: Supabase CLI (Local Development)
```bash
npx supabase db push
# or
npx supabase migration up
```

---

## 2. Verify Storage Bucket Configuration in Supabase Dashboard

The migration automatically registers the bucket in `storage.buckets`, but you can verify it in the UI:

1. In your Supabase Dashboard, click **Storage** in the left navigation.
2. Look for the bucket named **`products`**.
3. If it is already listed, click the **three dots (`...`)** next to `products` and click **Edit bucket**:
   - **Bucket name**: `products`
   - **Public bucket**: **Enabled (Checked)** *(Important: must be public so storefront users can view product images without signing in)*
   - **File size limit**: `50 MB` (or enter `52428800` bytes to accommodate product demo videos)
   - **Allowed MIME types**:
     ```
     image/jpeg, image/png, image/webp, image/gif, image/svg+xml, image/avif, video/mp4, video/webm, video/quicktime, video/ogg
     ```
4. Click **Save**.

---

## 3. Storage Security & Policies (RLS)

Storage security is governed by Row Level Security on the `storage.objects` table. The migration creates 4 policies:

| Policy Name | Target Operation | Target Audience | Condition |
| :--- | :--- | :--- | :--- |
| `products_storage_select_public` | `SELECT` | Public / Anon | Anyone can view product assets in `products` bucket |
| `products_storage_insert_admin` | `INSERT` | Admin | Authenticated users with role `'admin'` |
| `products_storage_update_admin` | `UPDATE` | Admin | Authenticated users with role `'admin'` |
| `products_storage_delete_admin` | `DELETE` | Admin | Authenticated users with role `'admin'` |

### How to verify in Dashboard:
1. Go to **Storage** -> **Policies**.
2. Locate the `products` bucket policies section.
3. Confirm that all four policies (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) are active.

---

## 4. CORS Configuration (For Direct Browser Uploads)

If uploading directly from the browser to Supabase Storage, ensure your dashboard domain is allowed in CORS:

1. In Supabase Dashboard, go to **Project Settings** (gear icon) -> **API** (or **Storage**).
2. Under **Storage Settings** or CORS configuration, ensure the allowed origins include:
   - `http://localhost:3000`
   - `http://localhost:3001`
   - `http://localhost:3003`
   - Your production domains (e.g. `https://admin.yourdomain.com`, `https://yourdomain.com`)

---

## 5. Storage Path Convention Used by the Application

Assets are stored under clean, organized paths inside the `products` bucket:
- **Banner image**: `products/{productId or draft}/banner_{timestamp}_{filename}`
- **Gallery image**: `products/{productId or draft}/images_{timestamp}_{filename}`
- **Product video**: `products/{productId or draft}/videos_{timestamp}_{filename}`

### Public Asset URL format:
```
https://<YOUR_PROJECT_REF>.supabase.co/storage/v1/object/public/products/<storage_path>
```
The helper function `getProductAssetUrl(storage_path)` in `apps/dashboard/src/lib/supabase/storage.js` automatically constructs this URL.
