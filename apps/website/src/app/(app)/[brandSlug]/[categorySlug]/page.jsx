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
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ActiveFilterChips,
  DesktopProductFilters,
  MobileFilterHeader,
  CategoryProducts,
} from "../_components/product-filters";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { brandSlug, categorySlug } = await params;
  const [brand, category] = await Promise.all([
    fetchBrandBySlug(brandSlug),
    fetchCategoryBySlug(categorySlug),
  ]);
  if (!brand || !category) return { title: "Page Not Found" };

  return {
    title: `${brand.name} ${category.name} | Hardware & PC Components`,
    description:
      category.description ||
      `Browse ${brand.name} ${category.name} and related laptop components.`,
  };
}

export default async function BrandCategoryPage({ params, searchParams }) {
  const { brandSlug, categorySlug } = await params;
  const queryParams = await searchParams;

  // Fetch brand and category data in parallel
  const [brandData, categoryData, categories, brands] = await Promise.all([
    fetchBrandBySlug(brandSlug),
    fetchCategoryBySlug(categorySlug),
    fetchStoreCategoriesWithCount(),
    fetchStoreBrands(),
  ]);

  if (!brandData || !categoryData) {
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
              <Link href={`/${brandSlug}`}>{brandData.name}</Link>
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
            {brandData.name} {categoryData.name}
          </h1>
        </div>

        <MobileFilterHeader
          categories={categories}
          brands={brands}
          activeBrandSlug={brandSlug}
          activeCategorySlug={categorySlug}
        />
      </div>

      {/* Main Layout: Desktop Sidebar + Products Content */}
      <div className="mt-6 flex flex-col items-start gap-8 lg:flex-row">
        {/* Desktop Sticky Filter Sidebar */}
        <DesktopProductFilters
          categories={categories}
          brands={brands}
          activeBrandSlug={brandSlug}
          activeCategorySlug={categorySlug}
        />

        {/* Products Section */}
        <div className="w-full min-w-0 flex-1">
          {/* Active Filter Chips Bar */}
          <ActiveFilterChips
            brands={brands}
            categories={categories}
            activeBrandSlug={brandSlug}
            activeCategorySlug={categorySlug}
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
          />
        </div>
      </div>
    </div>
  );
}
