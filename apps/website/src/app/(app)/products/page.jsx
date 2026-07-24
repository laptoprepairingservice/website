import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Pagination } from "@/components/ui/pagination";
import { ProductFilters } from "@/components/store/product-filters";
import { ProductGrid } from "@/components/store/product-card";
import { CATEGORIES, PRODUCTS, getProductsByCategory } from "@/lib/data/products";

export const metadata = {
  title: "All Products",
  description: "Browse our complete catalog of computer hardware components.",
};

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const category = params?.category;
  const products = category ? getProductsByCategory(category) : PRODUCTS;
  const categoryName = category ? CATEGORIES.find((c) => c.id === category)?.name : "All Products";

  return (
    <div className="container-store py-8 lg:py-12">
      <Breadcrumb items={[{ label: "Products", href: "/products" }, { label: categoryName }]} />
      <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">{categoryName}</h1>
          <p className="mt-1 text-muted-foreground">{products.length} products found</p>
        </div>
      </div>

      <div className="mt-4 lg:hidden">
        <ProductFilters />
      </div>

      <div className="mt-8 flex gap-8">
        <ProductFilters />
        <div className="min-w-0 flex-1">
          <ProductGrid products={products} />
          <div className="mt-12">
            <Pagination currentPage={1} totalPages={3} baseHref="/products?" />
          </div>
        </div>
      </div>
    </div>
  );
}
