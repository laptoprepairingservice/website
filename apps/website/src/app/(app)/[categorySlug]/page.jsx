import { ProductGrid } from "@/components/store/product-card";
import {
  fetchCategoryBySlug,
  fetchStoreBrands,
  fetchStoreCategoriesWithCount,
  fetchStoreProducts,
} from "@/lib/store";
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
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ActiveFilterChips,
  DesktopProductFilters,
  MobileFilterHeader,
} from "./_components/product-filters";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { categorySlug } = await params;
  const category = await fetchCategoryBySlug(categorySlug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} | Hardware & PC Components`,
    description: category.description || `Browse ${category.name} and related laptop components.`,
  };
}

export default async function CategoryPage({ params, searchParams }) {
  const { categorySlug } = await params;
  const categoryData = await fetchCategoryBySlug(categorySlug);
  if (!categoryData) {
    notFound();
  }

  const queryParams = await searchParams;
  const brand = queryParams?.brand || "";
  const minPrice = queryParams?.minPrice || "";
  const maxPrice = queryParams?.maxPrice || "";
  const inStock = queryParams?.inStock || "";
  const sort = queryParams?.sort || "relevance";
  const currentPage = Math.max(1, Number(queryParams?.page) || 1);
  const pageSize = 12;

  const [allProducts, categories, brands] = await Promise.all([
    fetchStoreProducts({
      category: categorySlug,
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

  const categoryName = categoryData.name;

  // Construct base href for pagination preserving existing filter query params
  const paginationQuery = new URLSearchParams();
  if (brand) paginationQuery.set("brand", brand);
  if (minPrice) paginationQuery.set("minPrice", minPrice);
  if (maxPrice) paginationQuery.set("maxPrice", maxPrice);
  if (inStock) paginationQuery.set("inStock", inStock);
  if (sort && sort !== "relevance") paginationQuery.set("sort", sort);
  const paginationPrefix = `/${categorySlug}?${paginationQuery.toString()}${paginationQuery.toString() ? "&" : ""}`;

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
        <MobileFilterHeader
          categories={categories}
          brands={brands}
          activeCategorySlug={categorySlug}
        />
      </div>

      {/* Main Layout: Desktop Sidebar (strictly lg:block) + Products Content */}
      <div className="mt-6 flex flex-col items-start gap-8 lg:flex-row">
        {/* Desktop Sticky Filter Sidebar (hidden on mobile, strictly lg:block) */}
        <DesktopProductFilters
          categories={categories}
          brands={brands}
          activeCategorySlug={categorySlug}
        />

        {/* Main Products Grid Section (full width on mobile, flex-1 on desktop) */}
        <div className="w-full min-w-0 flex-1">
          {/* Active Filter Chips Bar */}
          <ActiveFilterChips brands={brands} activeCategorySlug={categorySlug} />

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
                No products match the selected filters in {categoryName}
              </h2>
              <p className="text-muted-foreground mx-auto mt-1 max-w-sm text-xs sm:text-sm">
                Try widening your price range, clearing brand filters, or checking availability.
              </p>
              <div className="mt-5">
                <Button asChild variant="outline" className="rounded-full">
                  <Link href={`/${categorySlug}`}>Clear Filters</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
