"use client";

import { cn } from "@/lib/utils";
import { Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "ui/components/button";

const normalizeUrls = (urls) =>
  (Array.isArray(urls) ? urls : [urls])
    .filter((u) => typeof u === "string" && u.length > 0)
    .map((u) => ({
      id: crypto.randomUUID(),
      url: u,
      name: u.split("/").pop() || "image",
    }));

// @deprecated use ImageUploader from ui package instead
export default function ImageUploader({
  multiple = false,
  maxSizeMB = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  defaultUrls = [],
  onChange,
  className,
}) {
  const inputRef = useRef(null);
  const [items, setItems] = useState(() => normalizeUrls(defaultUrls));

  // Sync when parent passes new URLs (e.g. after API load with logo_url / logo)
  const urlKey = Array.isArray(defaultUrls)
    ? defaultUrls.filter((u) => typeof u === "string").join("|")
    : typeof defaultUrls === "string"
      ? defaultUrls
      : "";
  useEffect(() => {
    const next = normalizeUrls(defaultUrls);
    if (next.length > 0) setItems(next);
  }, [urlKey]);

  const openPicker = () => inputRef.current?.click();

  const validate = (file) => {
    if (!allowedTypes.includes(file.type)) return "Invalid file type";
    if (file.size > maxSizeMB * 1024 * 1024) return "File too large";
    return null;
  };

  const pushFiles = (files) => {
    const list = Array.from(files);
    const validated = [];

    for (const file of list) {
      const e = validate(file);
      if (e) continue;

      validated.push({
        id: crypto.randomUUID(),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
      });
    }

    const next = multiple ? [...items, ...validated] : validated.slice(0, 1);
    setItems(next);
    onChange?.(next.map((i) => i.file).filter(Boolean));
  };

  const remove = (id) => {
    setItems((prev) => {
      const next = prev.filter((i) => i.id !== id);
      onChange?.(next.map((i) => i.file).filter(Boolean));
      return next;
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        multiple={multiple}
        accept={allowedTypes.join(",")}
        onChange={(e) => e.target.files && pushFiles(e.target.files)}
      />

      <div
        onClick={items.length === 0 ? openPicker : undefined}
        className={cn(
          "bg-muted/30 cursor-pointer rounded-lg border border-dashed p-6",
          items.length > 0 && "cursor-default"
        )}
      >
        {/* Empty State */}
        {items.length === 0 && (
          <div className="flex flex-col items-center text-center">
            <Upload className="text-muted-foreground mb-3 h-8 w-8" />
            <p className="text-sm">Click to upload or drag & drop</p>
            <span className="text-muted-foreground text-xs">
              Max {maxSizeMB}MB • {allowedTypes.length} file types
            </span>
          </div>
        )}

        {/* Preview Grid */}
        {items.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">{items.length} selected</span>
              <Button
                variant="outline"
                size="sm"
                type="button"
                className="h-8 text-xs"
                onClick={openPicker}
              >
                Add
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square h-24 overflow-hidden rounded-lg border md:h-32"
                >
                  <img src={item.url} alt={item.name} className="size-full object-contain" />

                  <button
                    onClick={() => remove(item.id)}
                    className="absolute top-2 right-2 rounded-full bg-black/60 p-1.5 opacity-0 group-hover:opacity-100"
                  >
                    <X className="size-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
