"use client";

import { DollarSign } from "lucide-react";
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
        {/* Profit & Margin Live Calculator */}
        <div className="bg-muted/30 border-border/80 grid grid-cols-3 gap-2 rounded-xl border p-3 text-center">
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

          <div className="space-y-1.5">
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

          <div className="flex items-center pt-5">
            <Controller
              name="default_variant.is_active"
              control={control}
              render={({ field }) => (
                <FormSwitch
                  id="variant-is-active"
                  label="Variant Active"
                  description="When inactive, this variant cannot be purchased."
                  checked={Boolean(field.value)}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
