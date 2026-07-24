"use client";

import { cn } from "@/lib/utils";

export function Checkbox({ className, label, id, ...props }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        id={id}
        className={cn(
          "size-4 rounded border border-input accent-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        {...props}
      />
      {label && <span className="text-sm text-foreground">{label}</span>}
    </label>
  );
}

export function RadioGroup({ name, options = [], value, onChange, className }) {
  return (
    <div className={cn("space-y-3", className)} role="radiogroup">
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

export function Select({ className, options = [], placeholder, ...props }) {
  return (
    <select className={cn("input-base appearance-none bg-[length:16px] bg-[right_12px_center] bg-no-repeat pr-10", className)} {...props}>
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
