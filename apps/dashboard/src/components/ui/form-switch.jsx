import { Label } from "ui/components/label";
import { Switch } from "ui/components/switch";

export function FormSwitch({ id, label, description, checked, onCheckedChange, disabled = false }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <Label htmlFor={id}>{label}</Label>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  );
}
