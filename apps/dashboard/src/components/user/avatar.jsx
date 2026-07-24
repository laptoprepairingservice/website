import { getAsset } from "@/utils";
import { cn } from "@/lib/utils";

export function AvatarImage({ name, image = null, className = "" }) {
  return (
    <>
      {image?.storage_path ? (
        <img
          src={getAsset(image?.storage_path)}
          alt={image?.name || "Image"}
          className={cn(
            "aspect-square size-full overflow-hidden rounded-lg object-cover",
            className
          )}
        />
      ) : (
        <div
          className={cn("flex items-center justify-center overflow-hidden font-mono", className)}
        >
          {name
            ?.trim()
            .split(/\s+/)
            .map((word) => word[0].toUpperCase())
            .slice(0, 2) // This ensures only the first two initials are shown
            .join("")}
        </div>
      )}
    </>
  );
}
