"use client";

import { ProductAssetsManager } from "../product-assets-manager";

export function ProductMediaSection({
  productPublicId,
  initialAssets = [],
  onChange,
  disabled = false,
}) {
  return (
    <div id="section-media" className="scroll-mt-24">
      <ProductAssetsManager
        productPublicId={productPublicId}
        initialAssets={initialAssets}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}
