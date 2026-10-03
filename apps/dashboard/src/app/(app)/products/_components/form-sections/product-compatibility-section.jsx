"use client";

import { useMemo } from "react";
import { Laptop } from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/shadcn/components/card";
import { Textarea } from "@ui/shadcn/components/textarea";
import { FieldError } from "./form-utils";

export function ProductCompatibilitySection({ register, errors, watch }) {
  const watchCompatibility = watch("compatibility");

  // Compatibility chips parsing
  const compatibilityList = useMemo(() => {
    if (!watchCompatibility) return [];
    return watchCompatibility
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [watchCompatibility]);

  return (
    <Card id="section-compatibility" className="rounded-xl border shadow-xs scroll-mt-24">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-violet-500/10 text-violet-600 dark:text-violet-400 flex size-8 items-center justify-center rounded-lg">
            <Laptop className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Device & Model Compatibility</CardTitle>
            <CardDescription className="text-xs">
              List supported laptop models, series, or part numbers to help customers verify hardware fit.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <Textarea
          id="compatibility"
          rows={4}
          placeholder="Enter supported laptop models (e.g. Dell Inspiron 15 3511, 3515, 3520, Vostro 3510, Latitude 3420) separated by commas or lines..."
          className="font-mono text-xs"
          {...register("compatibility")}
        />
        <FieldError message={errors.compatibility?.message} />

        {compatibilityList.length > 0 && (
          <div className="pt-1">
            <span className="text-muted-foreground block text-[11px] mb-1.5 font-medium">
              Recognized Models ({compatibilityList.length}):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
              {compatibilityList.map((model, idx) => (
                <Badge key={idx} variant="secondary" className="px-2 py-0.5 text-[11px] font-normal">
                  {model}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
