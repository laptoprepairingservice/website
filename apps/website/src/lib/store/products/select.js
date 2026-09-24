/**
 * Full SELECT query for product listings, detail pages, and related items
 */
export const PRODUCT_DETAIL_SELECT = `
  id,
  public_id,
  name,
  slug,
  short_description,
  description,
  specifications,
  compatibility,
  is_featured,
  is_bestseller,
  created_at,
  status,
  schema_org_jsonld,
  categories (id, name, slug),
  brands (id, name, slug),
  product_variants (
    id,
    public_id,
    sku,
    price,
    compare_at_price,
    variant_name,
    is_default,
    is_active,
    options
  ),
  product_images (
    id,
    storage_path,
    sort_order,
    is_banner
  )
`;

/**
 * Fast SELECT query for autocomplete / live search combobox
 */
export const PRODUCT_LIVE_SEARCH_SELECT = `
  id,
  public_id,
  name,
  slug,
  short_description,
  status,
  categories (id, name, slug),
  brands (id, name, slug),
  product_variants (
    id,
    public_id,
    sku,
    price,
    compare_at_price,
    is_default,
    is_active
  ),
  product_images (
    id,
    storage_path,
    sort_order,
    is_banner
  )
`;

/**
 * SELECT query for mobile category sheet drilldown
 */
export const PRODUCT_CATEGORY_SELECT = `
  id,
  public_id,
  name,
  slug,
  short_description,
  description,
  is_featured,
  is_bestseller,
  status,
  created_at,
  categories (id, name, slug),
  brands (id, name, slug),
  product_variants (
    id,
    sku,
    price,
    compare_at_price,
    variant_name,
    is_default,
    is_active
  ),
  product_images (
    id,
    storage_path,
    sort_order,
    is_banner
  )
`;
