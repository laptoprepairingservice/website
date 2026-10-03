"use client";

import { Wrench } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@ui/shadcn/components/card";
import { FormRichTextEditor } from "@/components/ui/rich-text-editor";

export function ProductSpecificationsSection({ control, errors, isSubmitting }) {
  return (
    <Card id="section-specs" className="rounded-xl border shadow-xs scroll-mt-24">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-2">
          <div className="bg-sky-500/10 text-sky-600 dark:text-sky-400 flex size-8 items-center justify-center rounded-lg">
            <Wrench className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">Hardware Specifications</CardTitle>
            <CardDescription className="text-xs">
              Detailed component specifications table shown under the Specifications tab on storefront product pages.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <FormRichTextEditor
          label="Specification Table"
          name="specifications"
          control={control}
          error={errors.specifications?.message}
          placeholder="Use the table tool or click 'Spec Template' to format technical parameters (e.g. Speed, Pins, Voltage, Form Factor)..."
          disabled={isSubmitting}
          minHeight="200px"
        />
      </CardContent>
    </Card>
  );
}
