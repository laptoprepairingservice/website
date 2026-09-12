"use client";

import { Controller } from "react-hook-form";
import { Label } from "@ui/shadcn/components/label";
import { RichTextEditor } from "@ui/shadcn/components/rich-text-editor";

export { RichTextEditor };

export function FormRichTextEditor({
  label,
  name,
  control,
  error,
  placeholder,
  disabled = false,
  minHeight = "200px",
  className,
  description,
  allowTables = true,
  onInsertSpecTemplate,
  ...rest
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="space-y-2">
          {label ? (
            <div className="flex items-center justify-between">
              <Label htmlFor={name}>{label}</Label>
              {description ? (
                <span className="text-muted-foreground text-xs">{description}</span>
              ) : null}
            </div>
          ) : null}
          <RichTextEditor
            id={name}
            value={field.value || ""}
            onChange={field.onChange}
            placeholder={placeholder}
            error={Boolean(error)}
            disabled={disabled}
            minHeight={minHeight}
            className={className}
            allowTables={allowTables}
            onInsertSpecTemplate={onInsertSpecTemplate}
            {...rest}
          />
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </div>
      )}
    />
  );
}

export default RichTextEditor;
