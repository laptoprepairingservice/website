import { notFound } from "next/navigation";
import { ProductDetail } from "./_components/product-detail";
import { ProductJsonLd } from "./_components/structured-data";
import { fetchProductBySlug, fetchRelatedProducts, fetchAllProductSlugs } from "@/lib/store";

export const revalidate = 60;

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) {
    notFound();
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
  const { slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: product.image ? [product.image] : [],
    },
  };
}

export async function generateStaticParams() {
  const products = await fetchAllProductSlugs();
  return products.map((p) => ({ slug: p.slug }));
}
