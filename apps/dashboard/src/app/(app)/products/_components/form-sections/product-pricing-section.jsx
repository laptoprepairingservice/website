"use client";

import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  DollarSign,
  Package,
  XCircle,
} from "lucide-react";
import { Controller } from "react-hook-form";
import { Badge } from "@ui/shadcn/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/shadcn/components/card";
import { Input } from "@ui/shadcn/components/input";
import { Label } from "@ui/shadcn/components/label";
import { Separator } from "@ui/shadcn/components/separator";
import { FormSelect } from "@/components/ui/select";
import { FormSwitch } from "@/components/ui/form-switch";
import { cn } from "@/lib/utils";
import { FieldError, inputClassName } from "./form-utils";

export function ProductPricingSection({
  register,
  control,
  errors,
  conditionOptions,
  watch,
}) {
  const priceVal = parseFloat(watch("default_variant.price")) || 0;
  const costVal = parseFloat(watch("default_variant.cost_price")) || 0;
  const compareVal = parseFloat(watch("default_variant.compare_at_price")) || 0;
  const profit = priceVal > 0 && costVal > 0 ? priceVal - costVal : null;
  const margin =
    profit != null && priceVal > 0 ? ((profit / priceVal) * 100).toFixed(1) : null;
  const discountPct =
    compareVal > priceVal ? Math.round(((compareVal - priceVal) / compareVal) * 100) : null;

  // Stock Management & Availability state
  const rawStock = watch("default_variant.stock_quantity");
  const stockQty = rawStock === "" || rawStock === undefined || rawStock === null ? 0 : parseInt(rawStock, 10);
  const rawThreshold = watch("default_variant.low_stock_threshold");
  const lowStockThreshold = rawThreshold === "" || rawThreshold === undefined || rawThreshold === null ? 5 : parseInt(rawThreshold, 10);
  const isOutOfStock = Boolean(watch("default_variant.is_out_of_stock"));
  const isVariantActive = watch("default_variant.is_active") !== false;

  // Compute live stock availability preview
  const getStockStatus = () => {
    if (!isVariantActive) {
      return {
        label: "Inactive",
        badgeVariant: "secondary",
        badgeClass: "bg-muted text-muted-foreground border-border",
        Icon: XCircle,
        description: "This variant is inactive and will not appear for sale on the storefront.",
      };
    }
    if (isOutOfStock) {
      return {
        label: "Forced Out of Stock",
        badgeVariant: "destructive",
        badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        Icon: XCircle,
        description: "Manually forced out of stock. Storefront customers cannot add this item to cart.",
      };
    }
    if (stockQty <= 0) {
      return {
        label: "Out of Stock (0 units)",
        badgeVariant: "destructive",
        badgeClass: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
        Icon: XCircle,
        description: "Inventory count is zero. Customers cannot purchase until restocked.",
      };
    }
    if (stockQty <= lowStockThreshold) {
      return {
        label: `Low Stock (${stockQty} units)`,
        badgeVariant: "secondary",
        badgeClass: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
        Icon: AlertTriangle,
        description: `Stock level (${stockQty}) is at or below the low stock threshold of ${lowStockThreshold}.`,
      };
    }
    return {
      label: `In Stock (${stockQty} units)`,
      badgeVariant: "default",
      badgeClass: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      Icon: CheckCircle2,
      description: "Inventory is healthy and ready for storefront sales.",
    };
  };

  const status = getStockStatus();
  const StatusIcon = status.Icon;

  return (
    <Card id="section-pricing" className="rounded-xl border shadow-xs scroll-mt-24">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex size-8 items-center justify-center rounded-lg">
            <DollarSign className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Pricing & Sellable Variant</CardTitle>
            <CardDescription className="text-xs">
              Set consumer prices, calculate margins, assign barcode, and configure fulfillment.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        {/* Profit, Margin & Stock Live Calculator */}
        <div className="bg-muted/30 border-border/80 grid grid-cols-2 gap-2 rounded-xl border p-3 text-center sm:grid-cols-4">
          <div>
            <span className="text-muted-foreground block text-[11px] font-medium">
              Selling Price
            </span>
            <span className="text-foreground text-sm font-bold sm:text-base">
              {priceVal > 0 ? `₹${priceVal.toLocaleString("en-IN")}` : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px] font-medium">
              Estimated Profit
            </span>
            <span
              className={cn(
                "text-sm font-bold sm:text-base",
                profit != null
                  ? profit >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {profit != null ? `₹${profit.toLocaleString("en-IN")}` : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px] font-medium">
              Gross Margin
            </span>
            <span
              className={cn(
                "text-sm font-bold sm:text-base",
                margin != null
                  ? Number(margin) >= 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {margin != null ? `${margin}%` : "—"}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block text-[11px] font-medium">
              Stock Availability
            </span>
            <span className="mt-0.5 inline-flex items-center justify-center">
              <Badge
                variant="outline"
                className={cn("px-2 py-0.5 text-[11px] font-semibold gap-1", status.badgeClass)}
              >
                <StatusIcon className="size-3 shrink-0" />
                <span className="truncate">{status.label}</span>
              </Badge>
            </span>
          </div>
        </div>

        {/* Price Fields */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="price" className="text-xs font-semibold">
              Selling Price (₹) <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs">
                ₹
              </span>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={cn(inputClassName, "pl-7 font-medium")}
                {...register("default_variant.price")}
              />
            </div>
            <FieldError message={errors.default_variant?.price?.message} />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="compare_at_price" className="text-xs font-semibold">
                Original Price (₹)
              </Label>
              {discountPct && discountPct > 0 && (
                <Badge variant="secondary" className="px-1.5 py-0 text-[10px] text-emerald-600 dark:text-emerald-400">
                  {discountPct}% OFF
                </Badge>
              )}
            </div>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs">
                ₹
              </span>
              <Input
                id="compare_at_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={cn(inputClassName, "pl-7")}
                {...register("default_variant.compare_at_price")}
              />
            </div>
            <FieldError message={errors.default_variant?.compare_at_price?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cost_price" className="text-xs font-semibold">
              Cost Per Item (₹)
            </Label>
            <div className="relative">
              <span className="text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 text-xs">
                ₹
              </span>
              <Input
                id="cost_price"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className={cn(inputClassName, "pl-7")}
                {...register("default_variant.cost_price")}
              />
            </div>
            <FieldError message={errors.default_variant?.cost_price?.message} />
          </div>
        </div>

        <Separator />

        {/* Variant Attributes */}
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="variant_sku" className="text-xs font-semibold">
              Variant SKU <span className="text-destructive">*</span>
            </Label>
            <Input
              id="variant_sku"
              className={inputClassName}
              placeholder="e.g. KB-DEL-3511-NEW"
              {...register("default_variant.sku")}
            />
            <FieldError message={errors.default_variant?.sku?.message} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="variant_name" className="text-xs font-semibold">
              Variant Label <span className="text-muted-foreground font-normal">(e.g. 16GB / Black)</span>
            </Label>
            <Input
              id="variant_name"
              className={inputClassName}
              placeholder="e.g. Standard Black (US Layout)"
              {...register("default_variant.variant_name")}
            />
            <FieldError message={errors.default_variant?.variant_name?.message} />
          </div>

          <FormSelect
            label="Condition"
            name="default_variant.condition"
            control={control}
            options={conditionOptions}
            error={errors.default_variant?.condition?.message}
          />

          <div className="space-y-1.5">
            <Label htmlFor="barcode" className="text-xs font-semibold">
              Barcode / EAN / UPC <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              id="barcode"
              className={inputClassName}
              placeholder="e.g. 8901234567890"
              {...register("default_variant.barcode")}
            />
            <FieldError message={errors.default_variant?.barcode?.message} />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="weight_grams" className="text-xs font-semibold">
              Shipping Weight <span className="text-muted-foreground font-normal">(Grams)</span>
            </Label>
            <Input
              id="weight_grams"
              type="number"
              min="0"
              step="1"
              className={inputClassName}
              placeholder="e.g. 250"
              {...register("default_variant.weight_grams")}
            />
            <FieldError message={errors.default_variant?.weight_grams?.message} />
          </div>
        </div>

        <Separator />

        {/* Stock Management & Inventory Availability Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 text-primary flex size-7 items-center justify-center rounded-lg">
              <Boxes className="size-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Stock & Inventory Management
              </h4>
              <p className="text-[11px] text-muted-foreground">
                Track available physical stock count, set low stock alert trigger, and control storefront availability.
              </p>
            </div>
          </div>

          {/* Stock Inputs */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="stock_quantity" className="text-xs font-semibold flex items-center gap-1.5">
                <Package className="size-3.5 text-muted-foreground" />
                <span>Stock Quantity (Units)</span>
              </Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                step="1"
                placeholder="0"
                className={inputClassName}
                {...register("default_variant.stock_quantity")}
              />
              <p className="text-[11px] text-muted-foreground">
                Available units currently physically in warehouse stock.
              </p>
              <FieldError message={errors.default_variant?.stock_quantity?.message} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="low_stock_threshold" className="text-xs font-semibold flex items-center gap-1.5">
                <AlertTriangle className="size-3.5 text-amber-500" />
                <span>Low Stock Threshold</span>
              </Label>
              <Input
                id="low_stock_threshold"
                type="number"
                min="0"
                step="1"
                placeholder="5"
                className={inputClassName}
                {...register("default_variant.low_stock_threshold")}
              />
              <p className="text-[11px] text-muted-foreground">
                Displays low stock alert when inventory reaches this number or below (default 5).
              </p>
              <FieldError message={errors.default_variant?.low_stock_threshold?.message} />
            </div>
          </div>

          {/* Live Storefront Availability Feedback Card */}
          <div className="border-border/80 bg-muted/20 flex flex-col gap-2.5 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">Storefront Status:</span>
                <Badge
                  variant="outline"
                  className={cn("px-2 py-0.5 text-xs font-semibold gap-1", status.badgeClass)}
                >
                  <StatusIcon className="size-3.5 shrink-0" />
                  <span>{status.label}</span>
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-normal">
                {status.description}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <span className="text-[11px] font-medium text-muted-foreground block">
                Total Available
              </span>
              <span className="text-sm font-bold text-foreground sm:text-base">
                {isOutOfStock ? "0 (Forced)" : `${stockQty} Units`}
              </span>
            </div>
          </div>

          {/* Stock Toggles */}
          <div className="grid gap-3 sm:grid-cols-2 pt-1">
            <div className="border-border/80 bg-background/50 rounded-xl border p-3.5">
              <Controller
                name="default_variant.is_out_of_stock"
                control={control}
                render={({ field }) => (
                  <FormSwitch
                    id="variant-force-out-of-stock"
                    label="Force Out of Stock"
                    description="Immediately marks this variant as Out of Stock on the storefront, regardless of available physical units."
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="border-border/80 bg-background/50 rounded-xl border p-3.5">
              <Controller
                name="default_variant.is_active"
                control={control}
                render={({ field }) => (
                  <FormSwitch
                    id="variant-is-active"
                    label="Variant Active"
                    description="When inactive, this variant is completely disabled and cannot be purchased by customers."
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
