"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Upload, Trash2, Flag, Loader2, Play, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@ui/shadcn/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/shadcn/components/card";
import {
  deleteProductAssetAction,
  setProductBannerAction,
  uploadProductAssetAction,
} from "../_actions/product-assets";

const ACCEPTED_IMAGE_TYPES = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif";
const ACCEPTED_MEDIA_TYPES = `${ACCEPTED_IMAGE_TYPES},video/mp4,video/webm,video/quicktime`;

export function ProductAssetsManager({
  productPublicId = null,
  initialAssets = [],
  onChange = null,
  disabled = false,
}) {
  const bannerInputId = useId();
  const galleryInputId = useId();
  const bannerInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [banner, setBanner] = useState(() => initialAssets.find((a) => a.is_banner) || null);
  const [gallery, setGallery] = useState(() => initialAssets.filter((a) => !a.is_banner));
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Sync state if initialAssets changes externally
  const prevInitialRef = useRef(initialAssets);
  useEffect(() => {
    if (initialAssets !== prevInitialRef.current && Array.isArray(initialAssets)) {
      prevInitialRef.current = initialAssets;
      setBanner(initialAssets.find((a) => a.is_banner) || null);
      setGallery(initialAssets.filter((a) => !a.is_banner));
    }
  }, [initialAssets]);

  const notifyChange = (nextBanner, nextGallery) => {
    const combined = [...(nextBanner ? [nextBanner] : []), ...nextGallery];
    onChange?.(combined);
  };

  const getAssetKey = (item) => item?.public_id || item?.id || item?.storage_path;

  // Upload Banner
  const handleBannerUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;
    e.target.value = "";

    if (file.type?.startsWith("video/")) {
      toast.error("Banner must be an image, not a video.");
      return;
    }

    setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (productPublicId) formData.append("productPublicId", String(productPublicId));
      formData.append("isBanner", "true");
      formData.append("mediaType", "image");

      const result = await uploadProductAssetAction(formData);
      if (result.error) {
        toast.error(`Upload failed: ${result.error}`);
        return;
      }

      const newBanner = { ...result.asset, is_banner: true };
      const prevBanner = banner ? { ...banner, is_banner: false } : null;
      const nextGallery = prevBanner ? [prevBanner, ...gallery] : gallery;

      setBanner(newBanner);
      setGallery(nextGallery);
      notifyChange(newBanner, nextGallery);
      toast.success("Banner image uploaded.");
    } catch (err) {
      toast.error(err.message || "Failed to upload banner.");
    } finally {
      setUploadingBanner(false);
    }
  };

  // Remove Banner
  const handleRemoveBanner = async () => {
    if (!banner || disabled) return;
    if (!window.confirm("Remove banner image?")) return;

    if (banner.public_id || banner.id) {
      await deleteProductAssetAction({
        assetPublicId: banner.public_id || banner.id,
        storagePath: banner.storage_path,
      });
    }

    setBanner(null);
    notifyChange(null, gallery);
    toast.success("Banner removed.");
  };

  // Upload Gallery Images/Videos
  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || disabled) return;
    e.target.value = "";

    setUploadingGallery(true);
    const uploaded = [];

    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append("file", file);
        if (productPublicId) formData.append("productPublicId", String(productPublicId));
        formData.append("isBanner", "false");
        formData.append("mediaType", file.type?.startsWith("video/") ? "video" : "image");

        const result = await uploadProductAssetAction(formData);
        if (result.error) {
          toast.error(`Failed ${file.name}: ${result.error}`);
        } else if (result.asset) {
          uploaded.push({ ...result.asset, is_banner: false });
        }
      } catch (err) {
        toast.error(`Failed ${file.name}: ${err.message}`);
      }
    }

    setUploadingGallery(false);

    if (uploaded.length > 0) {
      const nextGallery = [...gallery, ...uploaded];
      setGallery(nextGallery);
      notifyChange(banner, nextGallery);
      toast.success(`Added ${uploaded.length} item${uploaded.length > 1 ? "s" : ""}.`);
    }
  };

  // Promote Gallery Item to Banner
  const handleMakeBanner = async (item) => {
    if (item.media_type === "video") {
      toast.error("Videos cannot be used as the banner.");
      return;
    }

    if (productPublicId && (item.id || item.public_id)) {
      const res = await setProductBannerAction({
        assetId: item.id,
        assetPublicId: item.public_id || item.id,
        productPublicId: String(productPublicId),
      });
      if (res.error) {
        toast.error(res.error);
        return;
      }
    }

    const itemKey = getAssetKey(item);
    const prevBanner = banner ? { ...banner, is_banner: false } : null;
    const newBanner = { ...item, is_banner: true };

    const nextGallery = gallery.filter((g) => getAssetKey(g) !== itemKey);
    if (prevBanner) {
      nextGallery.unshift(prevBanner);
    }

    setBanner(newBanner);
    setGallery(nextGallery);
    notifyChange(newBanner, nextGallery);
    toast.success("Set as banner image.");
  };

  // Delete Gallery Item
  const handleDeleteGalleryItem = async (item) => {
    if (!window.confirm("Delete this asset?")) return;

    if (item.public_id || item.id) {
      await deleteProductAssetAction({
        assetPublicId: item.public_id || item.id,
        storagePath: item.storage_path,
      });
    }

    const itemKey = getAssetKey(item);
    const nextGallery = gallery.filter((g) => getAssetKey(g) !== itemKey);
    setGallery(nextGallery);
    notifyChange(banner, nextGallery);
    toast.success("Asset deleted.");
  };

  return (
    <>
      {/* CARD 1: Banner Image */}
      <Card className="rounded-xl border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <Flag className="size-4 text-amber-500" />
                Product Banner
              </CardTitle>
              <CardDescription>
                Main hero banner image displayed at the top of the product page.
              </CardDescription>
            </div>
            {banner && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={disabled || uploadingBanner}
                >
                  {uploadingBanner ? "Uploading..." : "Replace banner"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-destructive hover:text-destructive"
                  onClick={handleRemoveBanner}
                  disabled={disabled || uploadingBanner}
                >
                  Remove
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <input
            id={bannerInputId}
            ref={bannerInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES}
            className="hidden"
            onChange={handleBannerUpload}
            disabled={disabled || uploadingBanner}
          />

          {banner ? (
            <div className="relative aspect-[21/9] w-full max-h-56 overflow-hidden rounded-lg border bg-black/5">
              <img
                src={banner.url}
                alt={banner.alt_text || "Product banner"}
                className="size-full object-cover"
              />
            </div>
          ) : (
            <div
              onClick={() => bannerInputRef.current?.click()}
              className="flex aspect-[21/9] max-h-40 w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center hover:bg-muted/40 transition"
            >
              {uploadingBanner ? (
                <Loader2 className="size-6 animate-spin text-primary" />
              ) : (
                <>
                  <Upload className="size-6 text-muted-foreground mb-1.5" />
                  <p className="text-xs font-medium">Click to upload banner image</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">JPEG, PNG, WebP, AVIF</p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CARD 2: Other Images & Videos */}
      <Card className="rounded-xl border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Other Images & Videos</CardTitle>
              <CardDescription>
                Additional gallery photos and demonstration videos.
              </CardDescription>
            </div>
            <Button
              type="button"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => galleryInputRef.current?.click()}
              disabled={disabled || uploadingGallery}
            >
              {uploadingGallery ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Plus className="size-3.5" />
              )}
              Add media
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <input
            id={galleryInputId}
            ref={galleryInputRef}
            type="file"
            multiple
            accept={ACCEPTED_MEDIA_TYPES}
            className="hidden"
            onChange={handleGalleryUpload}
            disabled={disabled || uploadingGallery}
          />

          {gallery.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {gallery.map((item, idx) => {
                const isVideo = item.media_type === "video";

                return (
                  <div
                    key={getAssetKey(item) || idx}
                    className="group relative aspect-square overflow-hidden rounded-lg border bg-muted/30"
                  >
                    {isVideo ? (
                      <div className="size-full flex items-center justify-center bg-black">
                        <video src={item.url} className="size-full object-cover opacity-80" />
                        <Play className="absolute size-6 fill-white text-white drop-shadow-md" />
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.alt_text || "Gallery item"}
                        className="size-full object-cover"
                      />
                    )}

                    {/* Hover Actions */}
                    <div className="absolute inset-0 flex flex-col justify-between bg-black/60 p-2 opacity-0 group-hover:opacity-100 transition">
                      <div className="flex justify-end">
                        <Button
                          type="button"
                          size="icon-sm"
                          variant="destructive"
                          className="size-6 rounded-full"
                          onClick={() => handleDeleteGalleryItem(item)}
                          title="Delete asset"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>

                      {!isVideo && (
                        <button
                          type="button"
                          onClick={() => handleMakeBanner(item)}
                          className="w-full rounded bg-amber-500 py-1 text-[10px] font-medium text-white hover:bg-amber-600 transition"
                        >
                          Make Banner
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              onClick={() => galleryInputRef.current?.click()}
              className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center cursor-pointer hover:bg-muted/20 transition"
            >
              {uploadingGallery ? (
                <Loader2 className="size-6 animate-spin text-primary" />
              ) : (
                <>
                  <Upload className="size-6 text-muted-foreground mb-1" />
                  <p className="text-xs text-muted-foreground">
                    Click to upload product images or videos
                  </p>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
