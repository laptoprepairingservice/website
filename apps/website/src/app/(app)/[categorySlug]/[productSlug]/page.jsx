import { notFound } from "next/navigation";
import { ProductDetail } from "./_components/product-detail";
import { ProductJsonLd } from "./_components/structured-data";
import { fetchProductBySlug, fetchRelatedProducts } from "@/lib/store";

export const revalidate = 60;

export default async function ProductDetailPage({ params }) {
  const { categorySlug, productSlug } = await params;
  const product = await fetchProductBySlug(productSlug);
  if (!product) {
    notFound();
  }

  // Validate category slug match (case-insensitive) if product has a category
  if (product.category && categorySlug) {
    if (product.category.toLowerCase() !== categorySlug.toLowerCase()) {
      notFound();
    }
  }

  const related = await fetchRelatedProducts(product, 4);
  return (
    <>
      <ProductJsonLd product={product} />
      <ProductDetail product={product} relatedProducts={related} />
    </>
  );
}

export async function generateMetadata({ params }) {
  const { productSlug } = await params;
  const product = await fetchProductBySlug(productSlug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: `${product.name} | Ranuja`,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.image ? [product.image] : [],
    },
  };
}
