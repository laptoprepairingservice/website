import Link from "next/link";
import { notFound } from "next/navigation";

import {
  fetchBrandBySlug,
  fetchCategoryBySlug,
  fetchStoreBrands,
  fetchStoreCategoriesWithCount,
} from "@/lib/store";
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
} from "../../../[brandSlug]/_components/product-filters";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { categorySlug, brandSlug } = await params;
  const [brand, category] = await Promise.all([
    fetchBrandBySlug(brandSlug),
    fetchCategoryBySlug(categorySlug),
  ]);
  if (!brand || !category) return { title: "Collection Not Found" };

  return {
    title: `${brand.name} ${category.name} | Collection`,
    description:
      category.description ||
      `Browse genuine OEM and replacement ${brand.name} ${category.name} for laptops.`,
  };
}

export default async function CategoryBrandCollectionPage({ params, searchParams }) {
  const { categorySlug, brandSlug } = await params;
  const queryParams = await searchParams;

  // Fetch category, brand, all categories with count, and brands in parallel
  const [categoryData, brandData, categories, brands] = await Promise.all([
    fetchCategoryBySlug(categorySlug),
    fetchBrandBySlug(brandSlug),
    fetchStoreCategoriesWithCount(),
    fetchStoreBrands(),
  ]);

  if (!categoryData || !brandData) {
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
            <BreadcrumbLink asChild>
              <Link href={`/collection/${categorySlug}`}>{categoryData.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{brandData.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title & Mobile Filter Header Row */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground truncate text-xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {brandData.name} {categoryData.name}
          </h1>
          {categoryData.description && (
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm line-clamp-1">
              {categoryData.description}
            </p>
          )}
        </div>

        <MobileFilterHeader
          categories={categories}
          brands={brands}
          activeCategorySlug={categorySlug}
          activeBrandSlug={brandSlug}
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
          activeBrandSlug={brandSlug}
          routeMode="collection"
        />

        {/* Products Section */}
        <div className="w-full min-w-0 flex-1">
          {/* Active Filter Chips Bar */}
          <ActiveFilterChips
            brands={brands}
            categories={categories}
            activeCategorySlug={categorySlug}
            activeBrandSlug={brandSlug}
            routeMode="collection"
          />

          {/* Product grid + pagination via List wrapper */}
          <CategoryProducts
            brandId={brandData.id}
            brandSlug={brandSlug}
            brandName={brandData.name}
            categoryId={categoryData.id}
            categorySlug={categorySlug}
            categoryName={categoryData.name}
            minPrice={minPrice}
            maxPrice={maxPrice}
            inStock={inStock}
            sort={sort}
            clearHref={`/collection/${categorySlug}/${brandSlug}`}
          />
        </div>
      </div>
    </div>
  );
}
