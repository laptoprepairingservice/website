"use client";

import { Icon } from "@iconify/react";
import { Controller } from "react-hook-form";

import { Label } from "@ui/shadcn/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/shadcn/components/select";

export const EMPTY_SELECT_VALUE = "__empty__";

export function toSelectOptions(items = [], valueKey = "id", labelKey = "name") {
  return items.map((item) => ({
    id: item[valueKey] ?? item.id ?? item.uuid ?? item.value,
    label: item[labelKey] ?? item.label ?? item.name,
  }));
}

export function toConstantSelectOptions(items = []) {
  return items.map((item) => ({
    id: item.value,
    label: item.label,
  }));
}

export default function SelectInput({
  label,
  value,
  onChange,
  disabled,
  error,
  options = [],
  loading = false,
  placeholder,
}) {
  const resolvedPlaceholder = placeholder ?? `Select ${label}`;

  return (
    <Select
      value={value || undefined}
      onValueChange={onChange}
      disabled={disabled || loading}
    >
      <SelectTrigger className={error ? "border-destructive" : ""}>
        {loading ? (
          <Icon icon="mdi:loading" className="text-muted-foreground size-4 animate-spin" />
        ) : (
          <SelectValue placeholder={resolvedPlaceholder} />
        )}
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={String(option.id)} value={String(option.id)}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function FormSelect({
  label,
  name,
  control,
  options,
  error,
  optional = false,
  optionalLabel = "None",
  coerceNumber = false,
  loading = false,
  disabled = false,
  placeholder,
}) {
  const selectOptions = optional
    ? [{ id: EMPTY_SELECT_VALUE, label: optionalLabel }, ...options]
    : options;

  function toFieldValue(next) {
    if (optional && next === EMPTY_SELECT_VALUE) {
      return "";
    }

    if (coerceNumber && next !== EMPTY_SELECT_VALUE) {
      return Number(next);
    }

    return next;
  }

  function toSelectValue(fieldValue) {
    if (fieldValue === "" || fieldValue == null) {
      return optional ? EMPTY_SELECT_VALUE : undefined;
    }

    return String(fieldValue);
  }

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <div className="space-y-2">
          <Label htmlFor={name}>{label}</Label>
          <SelectInput
            label={label}
            placeholder={placeholder}
            value={toSelectValue(field.value)}
            onChange={(next) => field.onChange(toFieldValue(next))}
            options={selectOptions}
            error={error}
            loading={loading}
            disabled={disabled}
          />
          {error ? <p className="text-destructive text-sm">{error}</p> : null}
        </div>
      )}
    />
  );
}
