"use client";

import { useEffect, useRef, useState } from "react";
import {
  Upload,
  Trash2,
  RefreshCw,
  Image as ImageIcon,
  X,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Reusable Image Uploader Component
 *
 * Supports:
 * 1. Loading and previewing images by URL (prop or user entry)
 * 2. Drag-and-drop and file picking with instant local preview
 * 3. Replacing existing images (file or URL)
 * 4. Deleting images with callback triggers
 * 5. Strictly local state management - NO internal API calls
 *
 * @param {Object} props
 * @param {string} [props.value] - Existing image URL (storage or remote)
 * @param {(fileOrUrl: File|string|null) => void} [props.onChange] - Triggered when image changes or is cleared
 * @param {(file: File) => void} [props.onFileSelect] - Triggered when a local file is picked
 * @param {(url: string) => void} [props.onUrlChange] - Triggered when a URL string is applied
 * @param {() => void} [props.onDelete] - Triggered when image is deleted
 * @param {(fileOrUrl: File|string) => void} [props.onReplace] - Triggered when replacing
 * @param {boolean} [props.disabled]
 * @param {string} [props.accept]
 * @param {number} [props.maxSizeMB]
 * @param {"square"|"video"|"banner"|"auto"} [props.aspectRatio]
 * @param {string} [props.className]
 * @param {string} [props.label]
 * @param {string} [props.helperText]
 * @param {string} [props.error]
 * @param {string} [props.id]
 */
export function ImageUploader({
  value = "",
  onChange,
  onFileSelect,
  onUrlChange,
  onDelete,
  onReplace,
  disabled = false,
  accept = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml,image/avif",
  maxSizeMB = 5,
  aspectRatio = "square",
  className,
  label,
  helperText,
  error,
  id,
}) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || "");
  const [internalError, setInternalError] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState("");
  const objectUrlRef = useRef(null);

  // Sync external value when it changes (e.g. form reset or initial async load)
  useEffect(() => {
    if (value === "") {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setPreviewUrl("");
    } else if (!objectUrlRef.current) {
      setPreviewUrl(value || "");
    }
  }, [value]);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFile = (file) => {
    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setInternalError(`File size exceeds ${maxSizeMB}MB limit.`);
      return;
    }
    setInternalError("");

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const newObjectUrl = URL.createObjectURL(file);
    objectUrlRef.current = newObjectUrl;
    setPreviewUrl(newObjectUrl);
    setShowUrlInput(false);
    setUrlInputValue("");

    if (previewUrl && onReplace) {
      onReplace(file);
    } else {
      onFileSelect?.(file);
    }
    onChange?.(file);
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
    e.target.value = "";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      handleFile(file);
    } else if (file) {
      setInternalError("Only image files are supported.");
    }
  };

  const handleDelete = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (disabled) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setPreviewUrl("");
    setInternalError("");
    setShowUrlInput(false);
    setUrlInputValue("");
    onDelete?.();
    onChange?.(null);
  };

  const handleTriggerPicker = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleApplyUrl = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    const trimmed = urlInputValue.trim();
    if (!trimmed) {
      setInternalError("Please enter a valid image URL.");
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setInternalError("");
    setPreviewUrl(trimmed);
    setShowUrlInput(false);

    if (previewUrl && onReplace) {
      onReplace(trimmed);
    } else {
      onUrlChange?.(trimmed);
    }
    onChange?.(trimmed);
  };

  const aspectRatioClasses = {
    square: "aspect-square max-w-[220px]",
    video: "aspect-video max-w-md",
    banner: "aspect-[21/9] w-full",
    auto: "min-h-[160px] w-full",
  }[aspectRatio] || "aspect-square max-w-[220px]";

  const displayError = error || internalError;

  return (
    <div className={cn("space-y-1.5", className)} id={id}>
      {label ? (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">{label}</span>
          {helperText ? (
            <span className="text-xs text-muted-foreground">{helperText}</span>
          ) : null}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
        className="hidden"
        tabIndex={-1}
      />

      {previewUrl ? (
        /* Preview State */
        <div
          className={cn(
            "group relative overflow-hidden rounded-xl border border-border bg-muted/30 shadow-xs transition-all",
            aspectRatioClasses,
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Uploaded preview"
            className="size-full object-contain p-2 transition-transform duration-200 group-hover:scale-[1.02]"
            onError={() => {
              setInternalError("Failed to load image from URL.");
            }}
          />

          {/* Action Overlay */}
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/45 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100 p-2">
            <button
              type="button"
              onClick={handleTriggerPicker}
              disabled={disabled}
              title="Replace with file"
              className="inline-flex items-center gap-1.5 rounded-lg bg-background/95 px-2.5 py-1.5 text-xs font-medium text-foreground shadow-xs hover:bg-background transition cursor-pointer"
            >
              <RefreshCw className="size-3.5" />
              Replace
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={disabled}
              title="Delete image"
              className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/90 px-2.5 py-1.5 text-xs font-medium text-destructive-foreground shadow-xs hover:bg-destructive transition cursor-pointer"
            >
              <Trash2 className="size-3.5" />
              Delete
            </button>
          </div>

          {/* Corner badge */}
          <div className="absolute top-2 right-2 flex items-center gap-1 rounded-md bg-background/80 px-2 py-0.5 text-[10px] font-medium text-muted-foreground shadow-xs backdrop-blur-xs group-hover:hidden">
            <ImageIcon className="size-3" />
            Image set
          </div>
        </div>
      ) : showUrlInput ? (
        /* Enter URL State */
        <div
          className={cn(
            "flex flex-col justify-center rounded-xl border border-border bg-muted/20 p-4 space-y-3",
            aspectRatioClasses
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
              <LinkIcon className="size-3.5 text-muted-foreground" />
              Paste Image URL
            </span>
            <button
              type="button"
              onClick={() => {
                setShowUrlInput(false);
                setInternalError("");
              }}
              className="text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <input
            type="url"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleApplyUrl(e);
              }
            }}
            placeholder="https://... or /categories/..."
            className="w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs shadow-xs focus:outline-none focus:ring-1 focus:ring-primary"
            autoFocus
          />

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyUrl}
              className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition cursor-pointer"
            >
              <Check className="size-3" />
              Apply
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(false)}
              className="inline-flex items-center rounded-md border border-input px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* Empty / Upload Dropzone State */
        <div
          onClick={handleTriggerPicker}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleTriggerPicker();
            }
          }}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all cursor-pointer select-none",
            aspectRatioClasses,
            isDragging
              ? "border-primary bg-primary/5 scale-[0.99]"
              : "border-border hover:border-primary/50 hover:bg-muted/30",
            displayError && "border-destructive bg-destructive/5",
            disabled && "opacity-50 pointer-events-none cursor-not-allowed"
          )}
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-muted text-muted-foreground mb-2 transition-transform group-hover:scale-110">
            <Upload className="size-4" />
          </div>
          <p className="text-xs font-medium text-foreground">
            <span className="text-primary hover:underline">Click to upload</span> or drag & drop
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">
            PNG, JPG, WEBP, or SVG up to {maxSizeMB}MB
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowUrlInput(true);
              setUrlInputValue("");
            }}
            className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition cursor-pointer"
          >
            <LinkIcon className="size-3" />
            or paste image URL
          </button>
        </div>
      )}

      {displayError ? (
        <p className="text-xs text-destructive mt-1 flex items-center gap-1">
          <X className="size-3 shrink-0" />
          {displayError}
        </p>
      ) : null}
    </div>
  );
}

export default ImageUploader;

