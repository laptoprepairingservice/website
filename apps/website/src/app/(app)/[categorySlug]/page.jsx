import {
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
} from "./_components/product-filters";
import { CategoryProducts } from "./_components/category-products";

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
  const queryParams = await searchParams;

  // Fetch category data for notFound check + sidebar (categories, brands)
  const [categoryData, categories, brands] = await Promise.all([
    fetchCategoryBySlug(categorySlug),
    fetchStoreCategoriesWithCount(),
    fetchStoreBrands(),
  ]);

  if (!categoryData) {
    notFound();
  }

  // Read URL filter params — passed to CategoryProducts so the List re-fetches
  // when the URL (and therefore server props) change
  const brand = queryParams?.brand || "";
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
            <BreadcrumbPage>{categoryData.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title & Mobile Filter Header Row */}
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground truncate text-xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            {categoryData.name}
          </h1>
        </div>

        <MobileFilterHeader
          categories={categories}
          brands={brands}
          activeCategorySlug={categorySlug}
        />
      </div>

      {/* Main Layout: Desktop Sidebar + Products Content */}
      <div className="mt-6 flex flex-col items-start gap-8 lg:flex-row">
        {/* Desktop Sticky Filter Sidebar */}
        <DesktopProductFilters
          categories={categories}
          brands={brands}
          activeCategorySlug={categorySlug}
        />

        {/* Products Section */}
        <div className="w-full min-w-0 flex-1">
          {/* Active Filter Chips Bar */}
          <ActiveFilterChips brands={brands} activeCategorySlug={categorySlug} />

          {/* Product grid + pagination via List wrapper */}
          <CategoryProducts
            categoryId={categoryData.id}
            categorySlug={categorySlug}
            categoryName={categoryData.name}
            brand={brand}
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
