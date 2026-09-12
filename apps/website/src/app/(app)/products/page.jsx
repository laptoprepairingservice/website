import { Breadcrumb } from "@ui/shadcn/components/breadcrumb";
import { Pagination } from "@ui/shadcn/components/pagination";
import { ProductFilters } from "@/components/store/product-filters";
import { ProductGrid } from "@/components/store/product-card";
import {
  fetchStoreProducts,
  fetchStoreCategories,
  fetchStoreBrands,
} from "@/lib/supabase/store-data";

export const metadata = {
  title: "All Products",
  description: "Browse our complete catalog of computer hardware components.",
};

export const revalidate = 60;

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;

  const [products, categories, brands] = await Promise.all([
    fetchStoreProducts({ category: category || null }),
    fetchStoreCategories(),
    fetchStoreBrands(),
  ]);

  const categoryName = category
    ? categories.find((c) => c.slug === category)?.name || "Products"
    : "All Products";

  return (
    <div className="py-8 lg:py-12">
      <Breadcrumb items={[{ label: "Products", href: "/products" }, { label: categoryName }]} />
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{categoryName}</h1>
          <p className="text-muted-foreground mt-1">{products.length} products found</p>
        </div>
      </div>

      <div className="mt-4 lg:hidden">
        <ProductFilters categories={categories} brands={brands} />
      </div>

      <div className="mt-8 flex gap-8">
        <ProductFilters categories={categories} brands={brands} />
        <div className="min-w-0 flex-1">
          {products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-base font-medium">No products available</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check back soon for new inventory in this category.
              </p>
            </div>
          )}
          {products.length > 12 && (
            <div className="mt-12">
              <Pagination currentPage={1} totalPages={Math.ceil(products.length / 12)} baseHref="/products?" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
