"use client";

import { Breadcrumb } from "@ui/shadcn/components/breadcrumb";
import { ProductGallery } from "./product-gallery";
import { ProductInfo } from "./product-info";
import { ProductTabs } from "./product-tabs";
import { RelatedProducts } from "./related-products";

export function ProductDetail({ product, relatedProducts = [] }) {
  if (!product) return null;

  const categoryLabel = (product.categoryName || product.category || "Hardware").replace("-", " ");

  return (
    <div className="container py-8 lg:py-12">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          {
            label: categoryLabel,
            href: `/${product.category || ""}`,
          },
          { label: product.name },
        ]}
      />

      {/* Top Product View: Swiper Image Slider & Product Buy Box */}
      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
        <ProductGallery product={product} />
        <ProductInfo product={product} />
      </div>

      {/* Product Details Tabs (Description, Specifications, Compatibility, Reviews) */}
      <ProductTabs product={product} />

      {/* Related Hardware Products */}
      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
