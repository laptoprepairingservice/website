"use client";

import { Button } from "@ui/shadcn/components/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@ui/shadcn/components/sheet";

export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  formId,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  onCancel,
  footerStart,
}) {
  function handleCancel() {
    if (onCancel) {
      onCancel();
      return;
    }

    onOpenChange(false);
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-lg">
        <SheetHeader className="border-b px-6 py-4 text-left">
          <SheetTitle>{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>

        <SheetFooter className="flex-row justify-end gap-2 border-t px-6 py-4">
          {footerStart}
          <Button type="button" variant="outline" onClick={handleCancel} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button type="submit" form={formId} disabled={loading || !formId}>
            {loading ? "Saving..." : submitLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
