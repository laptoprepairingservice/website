"use client";

import { cn } from "../lib/utils";

function RadioGroup({ name, options = [], value, onChange, className }) {
  return (
    <div className={cn("space-y-3", className)} role="radiogroup" data-slot="radio-group">
      {options.map((option) => (
        <label key={option.value} className="flex cursor-pointer items-center gap-3">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange?.(option.value)}
            className="size-4 accent-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <span className="text-sm text-foreground">{option.label}</span>
        </label>
      ))}
    </div>
  );
}

export { RadioGroup };
