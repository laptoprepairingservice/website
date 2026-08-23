"use client";

import { cn } from "../lib/utils";

function Select({ className, options = [], placeholder, ...props }) {
  return (
    <select
      data-slot="select"
      className={cn(
        "input-base appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10",
        className
      )}
      {...props}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export { Select };
