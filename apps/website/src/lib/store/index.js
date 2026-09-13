// Storage & Asset URLs
export {
  PRODUCT_STORAGE_BUCKET,
  getProductAssetUrl,
} from "./storage/product-assets";

// Supabase Public Client
export { getPublicSupabaseClient } from "./client";

// Product Selectors, Mappers & Queries
export {
  PRODUCT_CATEGORY_SELECT,
  PRODUCT_DETAIL_SELECT,
  PRODUCT_LIVE_SEARCH_SELECT,
} from "./products/select";
export { mapSupabaseProduct } from "./products/mapper";
export {
  fetchAllProductSlugs,
  fetchCategoryProducts,
  fetchProductBySlug,
  fetchRelatedProducts,
  fetchRelatedSearchProducts,
  fetchStoreProducts,
  searchStoreLive,
} from "./products/queries";

// Category Mappers & Queries
export { mapSupabaseCategory } from "./categories/mapper";
export {
  buildCategoryTree,
  fetchCategoryBySlug,
  fetchStoreCategories,
  fetchStoreCategoriesWithCount,
  fetchStoreCategoryTree,
} from "./categories/queries";

// Brand Mappers & Queries
export { mapSupabaseBrand } from "./brands/mapper";
export { fetchStoreBrands } from "./brands/queries";

// Home Data Queries
export { fetchStoreHomeData } from "./home/queries";
