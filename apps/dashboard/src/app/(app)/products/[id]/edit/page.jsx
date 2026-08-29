import { notFound } from "next/navigation";

import { ProductForm } from "../../_components/product-form";
import { getProductForEditAction } from "../../_actions/update-product";
import { getCatalogOptions } from "../../_lib/catalog-options";
import { toProductFormValues } from "../../_lib/product-mapper";
import { isUuid } from "../../_lib/uuid";

export default async function EditProductPage({ params }) {
  const { id: productPublicId } = await params;

  if (!isUuid(productPublicId)) {
    notFound();
  }

  const [catalogOptions, productResult] = await Promise.all([
    getCatalogOptions(),
    getProductForEditAction(productPublicId),
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
