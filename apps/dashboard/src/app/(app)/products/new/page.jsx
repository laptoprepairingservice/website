import { ProductForm } from "../_components/product-form";
import { getCatalogOptions } from "../_lib/catalog-options";
import { getProductFormDefaults } from "../_lib/product-schema";

export default async function NewProductPage() {
  const catalogOptions = await getCatalogOptions();

  return (
    <ProductForm
      mode="create"
      catalogOptions={catalogOptions}
      initialValues={getProductFormDefaults()}
    />
  );
}
