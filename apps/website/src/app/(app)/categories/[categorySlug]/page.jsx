import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchCategoryBySlug, fetchStoreBrands, fetchStoreCategoriesWithCount } from "@/lib/store";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@ui/shadcn/components/breadcrumb";
import {
  ActiveFilterChips,
  CategoryProducts,
  DesktopProductFilters,
  MobileFilterHeader,
} from "../../[brandSlug]/_components/product-filters";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { categorySlug } = await params;
  const category = await fetchCategoryBySlug(categorySlug);
  if (!category) return { title: "Collection Not Found" };

  return {
    title: category?.metaTitle || "",
    description: category?.metaDescription || "",
  };
}

export default async function CategoryCollectionPage({ params, searchParams }) {
  const { categorySlug } = await params;
  const queryParams = await searchParams;

  // Fetch category, all categories with count, and brands in parallel
  const [categoryData, categories, brands] = await Promise.all([
    fetchCategoryBySlug(categorySlug),
    fetchStoreCategoriesWithCount(),
    fetchStoreBrands(),
  ]);

  if (!categoryData) {
    notFound();
  }

  const minPrice = queryParams?.minPrice || "";
  const maxPrice = queryParams?.maxPrice || "";
  const inStock = queryParams?.inStock || "";
  const sort = queryParams?.sort || "relevance";

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
              <Link href="/collection">Collections</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{categoryData.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title & Mobile Filter Header Row */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground truncate text-xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {categoryData.name} Collection
          </h1>
          {categoryData.description && (
            <p className="text-muted-foreground mt-1 line-clamp-1 text-xs sm:text-sm">
              {categoryData.description}
            </p>
          )}
        </div>

        <MobileFilterHeader
          categories={categories}
          brands={brands}
          activeCategorySlug={categorySlug}
          routeMode="collection"
        />
      </div>

      {/* Main Layout: Desktop Sidebar + Products Content */}
      <div className="mt-6 flex flex-col items-start gap-8 lg:flex-row">
        {/* Desktop Sticky Filter Sidebar */}
        <DesktopProductFilters
          categories={categories}
          brands={brands}
          activeCategorySlug={categorySlug}
          routeMode="collection"
        />

        {/* Products Section */}
        <div className="w-full min-w-0 flex-1">
          {/* Active Filter Chips Bar */}
          <ActiveFilterChips
            brands={brands}
            categories={categories}
            activeCategorySlug={categorySlug}
            routeMode="collection"
          />

          {/* Product grid + pagination via List wrapper */}
          <CategoryProducts
            categoryId={categoryData.id}
            categorySlug={categorySlug}
            categoryName={categoryData.name}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStock={inStock}
            sort={sort}
          />
        </div>
      </div>
    </div>
  );
}
