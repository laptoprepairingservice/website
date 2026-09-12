import { isUuid } from "./uuid";

export async function fetchProductWithDefaultVariant(supabase, identifier) {
  if (!identifier) {
    return { product: null, defaultVariant: null, images: [], error: new Error("Identifier is required") };
  }

  const isNumeric =
    typeof identifier === "string" ? /^\d+$/.test(identifier) : typeof identifier === "number";
  const isUuidValue = isUuid(identifier);

  const applyFilter = (query) => {
    if (isUuidValue) {
      return query.eq("public_id", identifier);
    }
    if (isNumeric) {
      return query.eq("id", Number(identifier));
    }
    return query.eq("slug", identifier);
  };

  const fullSelect = `
    id,
    public_id,
    name,
    slug,
    category_id,
    brand_id,
    short_description,
    description,
    specifications,
    compatibility,
    sku,
    is_oem,
    status,
    is_featured,
    is_bestseller,
    meta_title,
    meta_description,
    product_variants (
      id,
      public_id,
      sku,
      barcode,
      variant_name,
      condition,
      price,
      compare_at_price,
      cost_price,
      weight_grams,
      is_default,
      is_active
    ),
    product_images (
      id,
      public_id,
      storage_path,
      alt_text,
      width,
      height,
      sort_order,
      is_banner,
      media_type,
      file_name,
      file_size,
      mime_type,
      created_at
    )
  `;

  let { data, error } = await applyFilter(supabase.from("products").select(fullSelect)).single();

  // Graceful fallback if phase-10 migration columns are not in schema yet
  if (
    error &&
    (error.message?.includes("product_images") ||
      error.message?.includes("column") ||
      error.code === "PGRST204" ||
      error.code === "42703")
  ) {
    const fallbackSelect = `
      id,
      public_id,
      name,
      slug,
      category_id,
      brand_id,
      short_description,
      description,
      specifications,
      compatibility,
      sku,
      is_oem,
      status,
      is_featured,
      is_bestseller,
      meta_title,
      meta_description,
      product_variants (
        id,
        public_id,
        sku,
        barcode,
        variant_name,
        condition,
        price,
        compare_at_price,
        cost_price,
        weight_grams,
        is_default,
        is_active
      ),
      product_images (
        id,
        storage_path,
        alt_text,
        width,
        height,
        sort_order,
        is_banner,
        created_at
      )
    `;

    const fallbackRes = await applyFilter(supabase.from("products").select(fallbackSelect)).single();

    if (!fallbackRes.error && fallbackRes.data) {
      data = fallbackRes.data;
      error = null;
    }
  }

  if (error || !data) {
    return { product: null, defaultVariant: null, images: [], error };
  }

  const variants = data.product_variants ?? [];
  const defaultVariant =
    variants.find((variant) => variant.is_default) ?? variants[0] ?? null;

  const rawImages = (data.product_images ?? []).sort((a, b) => {
    if (a.sort_order !== b.sort_order) {
      return a.sort_order - b.sort_order;
    }
    return new Date(a.created_at || 0) - new Date(b.created_at || 0);
  });

  const { product_variants: _variants, product_images: _images, ...productData } = data;

  const product = {
    ...productData,
    product_images: rawImages,
  };

  return { product, defaultVariant, images: rawImages, error: null };
}

export async function insertProduct(supabase, payload) {
  return supabase.from("products").insert(payload).select("id, public_id").single();
}

export async function insertDefaultVariant(supabase, payload) {
  return supabase.from("product_variants").insert(payload).select("id").single();
}

export async function updateProductByPublicId(supabase, productPublicId, payload) {
  return supabase
    .from("products")
    .update(payload)
    .eq("public_id", productPublicId)
    .select("id, public_id")
    .single();
}

export async function updateVariantByPublicId(supabase, variantPublicId, payload) {
  return supabase
    .from("product_variants")
    .update(payload)
    .eq("public_id", variantPublicId)
    .select("id, public_id")
    .single();
}

export async function deleteProductById(supabase, productId) {
  return supabase.from("products").delete().eq("id", productId);
}

export async function listProductImages(supabase, productId) {
  return supabase
    .from("product_images")
    .select(
      `
      id,
      public_id,
      storage_path,
      alt_text,
      width,
      height,
      sort_order,
      is_banner,
      media_type,
      file_name,
      file_size,
      mime_type,
      created_at
    `
    )
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
}

export async function insertProductImage(supabase, payload) {
  const fullSelect = `
    id,
    public_id,
    storage_path,
    alt_text,
    width,
    height,
    sort_order,
    is_banner,
    media_type,
    file_name,
    file_size,
    mime_type,
    created_at
  `;

  let res = await supabase
    .from("product_images")
    .insert(payload)
    .select(fullSelect)
    .single();

  // Graceful fallback if phase-10 columns (file_name, is_banner, etc.) do not exist yet in DB
  if (
    res.error &&
    (res.error.message?.includes("column") ||
      res.error.code === "PGRST204" ||
      res.error.code === "42703")
  ) {
    const legacyPayload = {
      product_id: payload.product_id,
      storage_path: payload.storage_path,
      alt_text: payload.alt_text ?? null,
      is_banner: Boolean(payload.is_banner),
      sort_order: payload.sort_order ?? 0,
    };

    const legacySelect = `
      id,
      storage_path,
      alt_text,
      width,
      height,
      sort_order,
      is_banner,
      created_at
    `;

    const fallbackRes = await supabase
      .from("product_images")
      .insert(legacyPayload)
      .select(legacySelect)
      .single();

    if (!fallbackRes.error && fallbackRes.data) {
      return {
        data: {
          ...fallbackRes.data,
          public_id: String(fallbackRes.data.id),
          is_banner: Boolean(payload.is_banner),
          media_type: payload.media_type || "image",
          file_name: payload.file_name || null,
          file_size: payload.file_size || null,
          mime_type: payload.mime_type || null,
        },
        error: null,
      };
    }
  }

  return res;
}

export async function insertProductImages(supabase, payloads) {
  if (!payloads || payloads.length === 0) {
    return { data: [], error: null };
  }

  const fullSelect = `
    id,
    public_id,
    storage_path,
    alt_text,
    width,
    height,
    sort_order,
    is_banner,
    media_type,
    file_name,
    file_size,
    mime_type,
    created_at
  `;

  let res = await supabase
    .from("product_images")
    .insert(payloads)
    .select(fullSelect);

  if (
    res.error &&
    (res.error.message?.includes("column") ||
      res.error.code === "PGRST204" ||
      res.error.code === "42703")
  ) {
    const legacyPayloads = payloads.map((p) => ({
      product_id: p.product_id,
      storage_path: p.storage_path,
      alt_text: p.alt_text ?? null,
      is_banner: Boolean(p.is_banner),
      sort_order: p.sort_order ?? 0,
    }));

    const fallbackRes = await supabase
      .from("product_images")
      .insert(legacyPayloads)
      .select("id, storage_path, alt_text, width, height, sort_order, is_banner, created_at");

    if (!fallbackRes.error && fallbackRes.data) {
      const augmented = fallbackRes.data.map((item, idx) => ({
        ...item,
        public_id: String(item.id),
        is_banner: Boolean(payloads[idx]?.is_banner),
        media_type: payloads[idx]?.media_type || "image",
        file_name: payloads[idx]?.file_name || null,
        file_size: payloads[idx]?.file_size || null,
        mime_type: payloads[idx]?.mime_type || null,
      }));
      return { data: augmented, error: null };
    }
  }

  return res;
}

export async function updateProductImageByPublicId(supabase, imagePublicId, payload) {
  const isNum =
    typeof imagePublicId === "string" ? /^\d+$/.test(imagePublicId) : typeof imagePublicId === "number";

  const applyImageId = (query) =>
    isNum ? query.eq("id", Number(imagePublicId)) : query.eq("public_id", imagePublicId);

  const fullSelect = `
    id,
    public_id,
    storage_path,
    alt_text,
    width,
    height,
    sort_order,
    is_banner,
    media_type,
    file_name,
    file_size,
    mime_type,
    created_at
  `;

  let res = await applyImageId(supabase.from("product_images").update(payload))
    .select(fullSelect)
    .single();

  if (
    res.error &&
    (res.error.message?.includes("column") ||
      res.error.code === "PGRST204" ||
      res.error.code === "42703")
  ) {
    const legacyPayload = {};
    if (payload.alt_text !== undefined) legacyPayload.alt_text = payload.alt_text;
    if (payload.sort_order !== undefined) legacyPayload.sort_order = payload.sort_order;

    const fallbackRes = await applyImageId(supabase.from("product_images").update(legacyPayload))
      .select("id, storage_path, alt_text, width, height, sort_order, created_at")
      .single();

    if (!fallbackRes.error && fallbackRes.data) {
      return {
        data: {
          ...fallbackRes.data,
          public_id: String(fallbackRes.data.id),
          is_banner: Boolean(payload.is_banner),
          media_type: "image",
        },
        error: null,
      };
    }
  }

  return res;
}

export async function deleteProductImageByPublicId(supabase, imagePublicId) {
  const isNum =
    typeof imagePublicId === "string" ? /^\d+$/.test(imagePublicId) : typeof imagePublicId === "number";

  if (isNum) {
    return supabase
      .from("product_images")
      .delete()
      .eq("id", Number(imagePublicId))
      .select("id, storage_path, product_id")
      .single();
  }

  return supabase
    .from("product_images")
    .delete()
    .eq("public_id", imagePublicId)
    .select("id, public_id, storage_path, product_id")
    .single();
}

export async function setBannerImage(supabase, productId, imageIdentifier) {
  const isNum =
    typeof imageIdentifier === "string"
      ? /^\d+$/.test(imageIdentifier)
      : typeof imageIdentifier === "number";

  // 1. Unset all previous banners for this product
  await supabase
    .from("product_images")
    .update({ is_banner: false })
    .eq("product_id", productId);

  // 2. Set is_banner = true on target asset
  const applyTarget = (q) => {
    if (isNum) {
      return q.eq("id", Number(imageIdentifier));
    }
    if (typeof imageIdentifier === "string" && imageIdentifier.includes("/")) {
      return q.eq("product_id", productId).eq("storage_path", imageIdentifier);
    }
    return q.eq("public_id", imageIdentifier);
  };

  let updateRes = await applyTarget(supabase.from("product_images").update({ is_banner: true }))
    .select("id, storage_path, alt_text, width, height, sort_order, is_banner, created_at")
    .single();

  if (updateRes.error) {
    // If matching by public_id failed or column doesn't exist, try matching by storage_path
    if (typeof imageIdentifier === "string" && !isNum) {
      updateRes = await supabase
        .from("product_images")
        .update({ is_banner: true })
        .eq("product_id", productId)
        .eq("storage_path", imageIdentifier)
        .select("id, storage_path, alt_text, width, height, sort_order, is_banner, created_at")
        .single();
    }
  }

  if (updateRes.error || !updateRes.data) {
    return {
      data: null,
      error: updateRes.error || { message: "Could not set banner image." },
    };
  }

  return {
    data: {
      ...updateRes.data,
      public_id: String(updateRes.data.id),
      is_banner: true,
      media_type: "image",
    },
    error: null,
  };
}

export async function syncProductImages(supabase, productId, assets = []) {
  if (!Array.isArray(assets)) return null;

  // 1. Fetch current database images for this product
  const { data: existingImages, error: fetchError } = await supabase
    .from("product_images")
    .select("id, storage_path, is_banner, sort_order")
    .eq("product_id", productId);

  if (fetchError) {
    return fetchError;
  }

  const existingList = existingImages || [];
  const existingById = new Map(existingList.map((img) => [img.id, img]));
  const existingByPath = new Map(existingList.map((img) => [img.storage_path, img]));

  // 2. Remove database images that were deleted from the form
  const keptIds = new Set(assets.map((a) => a.id).filter(Boolean));
  const keptPaths = new Set(assets.map((a) => a.storage_path).filter(Boolean));

  const toDelete = existingList.filter(
    (img) => !keptIds.has(img.id) && !keptPaths.has(img.storage_path)
  );

  for (const img of toDelete) {
    await supabase.from("product_images").delete().eq("id", img.id);
  }

  // 3. Unset previous banners if any asset is marked is_banner
  const hasBanner = assets.some((a) => Boolean(a.is_banner));
  if (hasBanner) {
    await supabase
      .from("product_images")
      .update({ is_banner: false })
      .eq("product_id", productId);
  }

  // 4. Update existing assets and insert any newly added ones
  let bannerAssigned = false;
  for (let i = 0; i < assets.length; i++) {
    const asset = assets[i];
    let isBanner = false;
    if (asset.is_banner && !bannerAssigned) {
      isBanner = true;
      bannerAssigned = true;
    }

    const existing =
      (asset.id && existingById.get(asset.id)) ||
      existingByPath.get(asset.storage_path);

    if (existing) {
      // Update existing record
      await supabase
        .from("product_images")
        .update({
          is_banner: isBanner,
          sort_order: i,
          alt_text: asset.alt_text?.trim() || null,
        })
        .eq("id", existing.id);
    } else if (asset.storage_path) {
      // Insert new image record
      await insertProductImage(supabase, {
        product_id: productId,
        storage_path: asset.storage_path,
        alt_text: asset.alt_text?.trim() || null,
        is_banner: isBanner,
        sort_order: i,
        media_type: asset.media_type || "image",
        file_name: asset.file_name || null,
        file_size: asset.file_size || null,
        mime_type: asset.mime_type || null,
      });
    }
  }

  return null;
}

export async function reorderProductImages(supabase, orderedPublicIds = []) {
  const updates = orderedPublicIds.map((publicId, index) =>
    supabase
      .from("product_images")
      .update({ sort_order: index })
      .eq("public_id", publicId)
  );
  return Promise.all(updates);
}

export function formatSupabaseError(error, fallbackMessage) {
  if (!error) {
    return fallbackMessage;
  }

  if (error.code === "23505") {
    if (error.message?.includes("products_slug")) {
      return "A product with this slug already exists.";
    }
    if (error.message?.includes("sku")) {
      return "This SKU is already in use.";
    }
    return "A unique field value is already in use.";
  }

  if (error.message?.includes("is_primary")) {
    return "Legacy trigger 'trg_single_primary_image' is active on product_images. Please run: DROP TRIGGER IF EXISTS trg_single_primary_image ON public.product_images; in Supabase SQL Editor.";
  }

  return error.message || fallbackMessage;
}
