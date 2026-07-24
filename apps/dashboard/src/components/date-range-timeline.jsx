"use client";

import { Badge } from "ui/components/badge";
import { cn } from "@/lib/utils";

const TIMELINE_NODE =
  "shrink-0 size-2 rounded-full border-2 border-primary bg-background";

/**
 * Configurable date range timeline with optional "open ended" state.
 * Supports vertical and horizontal directions.
 *
 * @param {string} startDate - Formatted start date string (e.g. "Jan 15, 2025")
 * @param {string} endDate - Formatted end date string; ignored when openEnded is true
 * @param {boolean} openEnded - When true, shows openEndedLabel badge instead of end date
 * @param {"vertical" | "horizontal"} direction - Timeline layout direction
 * @param {string} startLabel - Label for start (default "From")
 * @param {string} endLabel - Label for end (default "To")
 * @param {string} openEndedLabel - Badge text when openEnded (default "Open Ended")
 * @param {string} className - Additional class names for the root
 * @param {string} emptyPlaceholder - Shown when a date is missing (default "N/A")
 */
export function DateRangeTimeline({
  startDate,
  endDate,
  openEnded = false,
  direction = "vertical",
  startLabel = "From",
  endLabel = "To",
  openEndedLabel = "Open Ended",
  className,
  emptyPlaceholder = "N/A",
}) {
  const start = startDate ?? emptyPlaceholder;
  const isVertical = direction === "vertical";

  return (
    <div
      className={cn(
        "flex text-sm",
        isVertical ? "flex-col gap-0" : "items-center gap-2",
        className,
      )}
      role="list"
      aria-label={`Date range: ${startLabel} ${start}${openEnded ? `, ${openEndedLabel}` : `, ${endLabel} ${endDate ?? emptyPlaceholder}`}`}
    >
      {isVertical ? (
        <>
          <div className="flex items-start gap-2">
            <div className={cn("mt-1.5", TIMELINE_NODE)} aria-hidden />
            <div className="flex gap-0.5">
              <span className="font-medium text-muted-foreground">
                {startLabel}:
              </span>
              <span>{start}</span>
            </div>
          </div>

          <div className="ml-[3px] w-px h-2 bg-border shrink-0" aria-hidden />

          <div className="flex items-start gap-2">
            <div className={cn("mt-1.5", TIMELINE_NODE)} aria-hidden />
            <div className="flex gap-0.5">
              {openEnded ? (
                <span className="font-medium text-muted-foreground">
                  {openEndedLabel}
                </span>
              ) : (
                <>
                  <span className="font-medium text-muted-foreground">
                    {endLabel}:
                  </span>
                  <span>{endDate ?? emptyPlaceholder}</span>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className={TIMELINE_NODE} aria-hidden />
            <div className="flex flex-col gap-0">
              <span className="text-xs font-medium text-muted-foreground">
                {startLabel}
              </span>
              <span className="text-xs">{start}</span>
            </div>
          </div>

          <div
            className={cn(
              "shrink-0 h-px bg-border flex-1",
              openEnded ? "w-4" : "min-w-4",
            )}
            aria-hidden
          />

          <div className="flex items-center gap-1.5 shrink-0">
            <div className={TIMELINE_NODE} aria-hidden />
            <div className="flex flex-col gap-0">
              {openEnded ? (
                <Badge variant="secondary" className="w-fit text-xs">
                  {openEndedLabel}
                </Badge>
              ) : (
                <>
                  <span className="text-xs font-medium text-muted-foreground">
                    {endLabel}
                  </span>
                  <span className="text-xs">{endDate ?? emptyPlaceholder}</span>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
