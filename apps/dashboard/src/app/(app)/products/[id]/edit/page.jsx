import { notFound } from "next/navigation";
import { ProductForm } from "../../_components/product-form";
import { getProductForEditAction } from "../../_actions/update-product";
import { getCatalogOptions } from "../../_lib/catalog-options";
import { toProductFormValues } from "../../_lib/product-mapper";

export default async function EditProductPage({ params }) {
  const { id: productIdentifier } = await params;

  const [catalogOptions, productResult] = await Promise.all([
    getCatalogOptions(),
    getProductForEditAction(productIdentifier),
  ]);

  console.log(productResult);

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
