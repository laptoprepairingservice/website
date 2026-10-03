"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Label } from "@ui/shadcn/components/label";
import { cn } from "@/lib/utils";

const RATING_LABELS = {
  1: "1 Star — Poor / Dissatisfied",
  2: "2 Stars — Below Average",
  3: "3 Stars — Average / Satisfactory",
  4: "4 Stars — Very Good / Recommended",
  5: "5 Stars — Outstanding / Highly Recommended",
};

export function StarRatingInput({ value = 5, onChange, error }) {
  const [hoverRating, setHoverRating] = useState(0);

  const activeRating = hoverRating || value || 5;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold text-foreground">
          Rating Score <span className="text-destructive">*</span>
        </Label>
        <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
          {RATING_LABELS[activeRating] || `${activeRating} Stars`}
        </span>
      </div>

      <div
        className="flex items-center gap-1.5 py-1"
        onMouseLeave={() => setHoverRating(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = star <= activeRating;
          return (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              onMouseEnter={() => setHoverRating(star)}
              className="group p-1 rounded-md transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              title={`${star} star${star > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "size-6 transition-colors",
                  isFilled
                    ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                    : "text-muted-foreground/30 hover:text-amber-300"
                )}
              />
            </button>
          );
        })}
        <span className="text-xs font-bold text-foreground ml-2">
          {activeRating}.0 / 5.0
        </span>
      </div>

      {error && <p className="text-destructive text-xs font-medium">{error}</p>}
    </div>
  );
}
