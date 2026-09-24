import {
  fetchBrandBySlug,
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
} from "./_components/product-filters";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { brandSlug } = await params;
  const brand = await fetchBrandBySlug(brandSlug);
  if (!brand) return { title: "Brand Not Found" };

  return {
    title: `${brand.name} Products | Hardware & PC Components`,
    description:
      brand.description || `Browse ${brand.name} laptops, components, and hardware.`,
  };
}

export default async function BrandPage({ params, searchParams }) {
  const { brandSlug } = await params;
  const queryParams = await searchParams;

  const [brandData, categories, brands] = await Promise.all([
    fetchBrandBySlug(brandSlug),
    fetchStoreCategoriesWithCount(),
    fetchStoreBrands(),
  ]);

  if (!brandData) {
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
            <BreadcrumbPage>{brandData.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title & Mobile Filter Header Row */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground truncate text-xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {brandData.name}
          </h1>
          {brandData.description && (
            <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
              {brandData.description}
            </p>
          )}
        </div>

        <MobileFilterHeader
          categories={categories}
          brands={brands}
          activeBrandSlug={brandSlug}
          activeCategorySlug=""
        />
      </div>

      {/* Main Layout: Desktop Sidebar + Products Content */}
      <div className="mt-6 flex flex-col items-start gap-8 lg:flex-row">
        {/* Desktop Sticky Filter Sidebar */}
        <DesktopProductFilters
          categories={categories}
          brands={brands}
          activeBrandSlug={brandSlug}
          activeCategorySlug=""
        />

        {/* Products Section */}
        <div className="w-full min-w-0 flex-1">
          {/* Active Filter Chips Bar */}
          <ActiveFilterChips
            brands={brands}
            categories={categories}
            activeBrandSlug={brandSlug}
            activeCategorySlug=""
          />

          {/* Product grid + pagination */}
          <CategoryProducts
            brandId={brandData.id}
            brandSlug={brandSlug}
            brandName={brandData.name}
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
