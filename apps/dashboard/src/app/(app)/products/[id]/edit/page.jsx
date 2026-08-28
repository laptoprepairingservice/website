import { notFound } from "next/navigation";

import { ProductForm } from "../../_components/product-form";
import { getProductForEditAction } from "../../_actions/update-product";
import { getCatalogOptions } from "../../_lib/catalog-options";
import { toProductFormValues } from "../../_lib/product-mapper";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const productId = Number(id);

  if (!Number.isInteger(productId) || productId <= 0) {
    notFound();
  }

  const [catalogOptions, productResult] = await Promise.all([
    getCatalogOptions(),
    getProductForEditAction(productId),
  ]);

  if (productResult.error || !productResult.product) {
    notFound();
  }

  return (
    <ProductForm
      mode="edit"
      catalogOptions={catalogOptions}
      initialValues={toProductFormValues(productResult.product, productResult.defaultVariant)}
    />
  );
}
