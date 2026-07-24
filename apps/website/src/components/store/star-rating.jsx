import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({ rating = 0, reviewCount, size = "sm", showCount = true, className }) {
  const sizes = { sm: "size-3.5", md: "size-4", lg: "size-5" };

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" aria-label={`Rating: ${rating} out of 5`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              sizes[size],
              i < Math.floor(rating)
                ? "fill-warning text-warning"
                : i < rating
                  ? "fill-warning/50 text-warning"
                  : "fill-muted text-muted"
            )}
          />
        ))}
      </div>
      {showCount && reviewCount !== undefined && (
        <span className="text-xs text-muted-foreground">({reviewCount})</span>
      )}
    </div>
  );
}
