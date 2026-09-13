"use client";

import { useEffect, useState } from "react";
import { Loader2, Package, Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getProductAssetUrl } from "@/lib/supabase/storage";
import { formatPrice } from "@/lib/format";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@ui/shadcn/components/dialog";
import { Button } from "@ui/shadcn/components/button";
import { Input } from "@ui/shadcn/components/input";
import { Badge } from "@ui/shadcn/components/badge";

export function ProductReferencePickerModal({
  open,
  onOpenChange,
  onSelectProduct,
  alreadySelectedIds = [],
  title = "Select Product Reference",
  description = "Search catalog products to attach or embed in this blog post.",
}) {
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      searchProducts("");
    }
  }, [open]);

  const searchProducts = async (term = "") => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("products")
      .select(`
        id,
        public_id,
        name,
        slug,
        sku,
        status,
        product_variants(id, price, compare_at_price, is_default),
        product_images(id, storage_path, is_banner, sort_order)
      `)
      .order("created_at", { ascending: false })
      .limit(20);

    if (term.trim()) {
      query = query.or(`name.ilike.%${term.trim()}%,sku.ilike.%${term.trim()}%`);
    }

    const { data, error } = await query;
    setLoading(false);
    if (!error && data) {
      setProducts(data);
    }
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    searchProducts(val);
  };

  function getProductBanner(p) {
    const banner = p.product_images?.find((img) => img.is_banner) || p.product_images?.[0];
    return banner?.storage_path ? getProductAssetUrl(banner.storage_path) : null;
  }

  function getProductPrice(p) {
    const defaultVar = p.product_variants?.find((v) => v.is_default) || p.product_variants?.[0];
    return defaultVar?.price != null ? Number(defaultVar.price) : null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="size-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by product title or SKU..."
            className="pl-9"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        {/* Product List */}
        <div className="flex-1 overflow-y-auto min-h-[300px] max-h-[420px] space-y-2 mt-3 pr-1">
          {loading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground text-sm">
              <Loader2 className="size-5 animate-spin mr-2" /> Searching catalog...
            </div>
          ) : products.length === 0 ? (
            <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground text-sm">
              No products found matching your search.
            </div>
          ) : (
            products.map((p) => {
              const bannerUrl = getProductBanner(p);
              const price = getProductPrice(p);
              const isAttached = alreadySelectedIds.includes(p.id);

              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/40 transition gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-11 rounded-md overflow-hidden bg-muted/40 border flex items-center justify-center shrink-0">
                      {bannerUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={bannerUrl} alt={p.name} className="size-full object-cover" />
                      ) : (
                        <Package className="size-5 text-muted-foreground/60" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{p.name}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {p.sku && <span className="font-mono">{p.sku}</span>}
                        {price != null && (
                          <span className="font-semibold text-primary">{formatPrice(price)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant={isAttached ? "secondary" : "default"}
                      onClick={() => {
                        onSelectProduct?.({
                          ...p,
                          bannerUrl,
                          price,
                        });
                      }}
                    >
                      {isAttached ? (
                        "Added"
                      ) : (
                        <>
                          <Plus className="size-3.5 mr-1" /> Select
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
