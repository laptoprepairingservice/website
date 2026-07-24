"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export default function PillLoading({
  label = "Loading...",
  fullScreen = true,
  className,
  pillClassName,
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center",
        fullScreen && "min-h-dvh w-full",
        className
      )}
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label={label}
    >
      <div
        className={cn(
          "flex items-center gap-3 rounded-full border",
          "border-border bg-background p-2 backdrop-blur-sm",
          "shadow-sm",
          pillClassName
        )}
      >
        {/* Spinner */}
        <div className="relative size-5 shrink-0">
          {/* Track */}
          <div className="absolute inset-0 rounded-full border-2 border-zinc-700/40" />

          {/* Rotating Arc + Glow */}
          <motion.div
            className="absolute inset-0 rounded-full"
            animate={{ rotate: 360 }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {/* Glow Layer */}
            <div
              className={cn(
                "absolute inset-0 rounded-full border-2 border-transparent border-t-white",
                "opacity-80 blur-[3px]",
                "dark:border-t-black"
              )}
            />

            {/* Core Arc */}
            <div className="absolute inset-0 rounded-full">
              {/* Outer Glow (wide diffusion) */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full border-2 border-transparent border-t-white",
                  "scale-110 opacity-70 blur-[6px]"
                )}
              />

              {/* Mid Glow */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full border-2 border-transparent border-t-white",
                  "scale-105 opacity-90 blur-[3px]"
                )}
              />

              {/* Core Arc (sharp edge) */}
              <div
                className={cn(
                  "absolute inset-0 rounded-full border-2 border-transparent border-t-white",
                  "drop-shadow-[0_0_10px_rgba(255,255,255,1)]"
                )}
              />
            </div>
          </motion.div>
        </div>

        {/* Label */}
        <span className="text-foreground text-sm font-medium tracking-tight">{label}</span>
      </div>
    </div>
  );
}
