import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ui/shadcn/components/breadcrumb";
import { Button } from "@ui/shadcn/components/button";
import { Pagination } from "@ui/shadcn/components/pagination";
import {
  ActiveFilterChips,
  CategoryPillsBar,
  DesktopProductFilters,
  MobileFilterHeader,
} from "@/app/(app)/products/_components/product-filters";
import { ProductGrid } from "@/components/store/product-card";
import { fetchStoreBrands, fetchStoreCategoriesWithCount, fetchStoreProducts } from "@/lib/store";

export const metadata = {
  title: "All Products | Hardware & PC Components",
  description: "Browse our complete catalog of computer hardware, components, and accessories.",
};

export const revalidate = 60;

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category || "";
  const brand = params?.brand || "";
  const minPrice = params?.minPrice || "";
  const maxPrice = params?.maxPrice || "";
  const inStock = params?.inStock || "";
  const sort = params?.sort || "relevance";
  const currentPage = Math.max(1, Number(params?.page) || 1);
  const pageSize = 12;

  const [allProducts, categories, brands] = await Promise.all([
    fetchStoreProducts({
      category: category || null,
      brand: brand || null,
      minPrice: minPrice || null,
      maxPrice: maxPrice || null,
      inStock: inStock || null,
      sort: sort !== "relevance" ? sort : null,
      limit: 200,
    }),
    fetchStoreCategoriesWithCount(),
    fetchStoreBrands(),
  ]);

  const totalProducts = allProducts.length;
  const totalPages = Math.ceil(totalProducts / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const displayedProducts = allProducts.slice(startIndex, startIndex + pageSize);

  // Compute title based on active category
  let categoryName = "All Hardware & Components";
  if (category) {
    const categorySlugs = category.split(",").map((s) => s.trim().toLowerCase());
    if (categorySlugs.length === 1) {
      const match = categories.find((c) => (c.slug || "").toLowerCase() === categorySlugs[0]);
      if (match) categoryName = match.name;
    } else {
      categoryName = `${categorySlugs.length} Categories Selected`;
    }
  }

  // Construct base href for pagination preserving existing filter query params
  const paginationQuery = new URLSearchParams();
  if (category) paginationQuery.set("category", category);
  if (brand) paginationQuery.set("brand", brand);
  if (minPrice) paginationQuery.set("minPrice", minPrice);
  if (maxPrice) paginationQuery.set("maxPrice", maxPrice);
  if (inStock) paginationQuery.set("inStock", inStock);
  if (sort && sort !== "relevance") paginationQuery.set("sort", sort);
  const paginationPrefix = `/products?${paginationQuery.toString()}${paginationQuery.toString() ? "&" : ""}`;

  return (
    <div className="container py-5 sm:py-7 lg:py-10">
      {/* Breadcrumb Navigation */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/products">Store</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{categoryName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title & Mobile Filter Header Row */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground truncate text-xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {categoryName}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-xs sm:text-sm">
            Showing {totalProducts > 0 ? startIndex + 1 : 0}–
            {Math.min(startIndex + pageSize, totalProducts)} of {totalProducts} products
          </p>
        </div>

        {/* Tiny filter icon button + sort on mobile header (strictly lg:hidden) */}
        <MobileFilterHeader categories={categories} brands={brands} />
      </div>

      {/* Single Horizontal Category Pills Bar (rendered ONCE) */}
      <div className="mt-3.5">
        <CategoryPillsBar categories={categories} />
      </div>

      {/* Main Layout: Desktop Sidebar (strictly lg:block) + Products Content */}
      <div className="mt-6 flex flex-col items-start gap-8 lg:flex-row">
        {/* Desktop Sticky Filter Sidebar (hidden on mobile, strictly lg:block) */}
        <DesktopProductFilters categories={categories} brands={brands} />

        {/* Main Products Grid Section (full width on mobile, flex-1 on desktop) */}
        <div className="w-full min-w-0 flex-1">
          {/* Active Filter Chips Bar */}
          <ActiveFilterChips categories={categories} brands={brands} />

          {displayedProducts.length > 0 ? (
            <>
              <ProductGrid products={displayedProducts} columns={3} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    baseHref={paginationPrefix}
                  />
                </div>
              )}
            </>
          ) : (
            /* Empty State */
            <div className="border-border bg-card/40 rounded-2xl border border-dashed px-6 py-16 text-center">
              <div className="bg-muted text-muted-foreground mx-auto flex size-12 items-center justify-center rounded-2xl">
                <span className="text-xl font-bold">✕</span>
              </div>
              <h2 className="text-foreground mt-4 text-lg font-bold">
                No products match the selected filters
              </h2>
              <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs sm:text-sm">
                Try widening your price range, clearing brand or category filters, or checking
                availability.
              </p>
              <div className="mt-5">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/products">Clear All Filters</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
