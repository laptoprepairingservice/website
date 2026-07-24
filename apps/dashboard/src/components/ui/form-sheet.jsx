import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "ui/components/sheet";
import { Button } from "ui/components/button";
export function FormSheet({
  open,
  onOpenChange,
  title,
  description,
  loading,
  submitLabel,
  onSubmit,
  children,
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="hide-scrollbar overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>

        {children}

        <SheetFooter>
          <Button disabled={loading} className="flex-1" onClick={onSubmit}>
            {loading ? "Saving..." : submitLabel}
          </Button>

          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
