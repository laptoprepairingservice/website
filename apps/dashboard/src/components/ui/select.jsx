import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "ui/components/select";
import { Icon } from "@iconify/react";

export default function SelectInput({
  label,
  value,
  onChange,
  disabled,
  error,
  options = [],
  loading = false,
}) {
  const placeholder = options.length === 1 ? options[0].name : "Select " + label;
  return (
    <>
      <Select
        label={label}
        value={value}
        onValueChange={onChange}
        disabled={disabled || loading}
        error={error}
        options={options}
        loading={loading}
      >
        <SelectTrigger className={error ? "border-red-500" : ""}>
          {loading ? (
            <Icon icon="mdi:loading" className="text-muted-foreground size-4 animate-spin" />
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {options.map((p) => (
            <SelectItem key={p.id} value={String(p.id)}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

export function toSelectOptions(items = [], valueKey = "id") {
  return items.map((item) => ({
    id: item[valueKey] ?? item.id ?? item.uuid,
    label: item.name,
  }));
}
