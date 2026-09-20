"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@ui/shadcn/components/button";
import { Input } from "@ui/shadcn/components/input";
import { Label } from "@ui/shadcn/components/label";
import {
  addAddressAction,
  updateAddressAction,
} from "@/app/(app)/account/addresses/_actions/address-actions";

// ─── Field helper ─────────────────────────────────────────────────────────────

function Field({ label, id, error, children, required, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Label tabs ───────────────────────────────────────────────────────────────

const LABELS = ["Home", "Work", "Other"];

function LabelPicker({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {LABELS.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            value === l
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

// ─── AddressForm ──────────────────────────────────────────────────────────────

/**
 * Reusable address form for both add and edit.
 * @param {Object} address - Existing address to edit (null for add)
 * @param {Function} onSuccess - Called when save succeeds
 * @param {Function} onCancel - Called when cancel is clicked
 */
export function AddressForm({ address = null, onSuccess, onCancel }) {
  const isEdit = Boolean(address);
  const formRef = useRef(null);

  const [label, setLabel] = useState(address?.label || "Home");
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPending(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    formData.set("label", label);

    const action = isEdit ? updateAddressAction : addAddressAction;
    const result = await action(formData);

    setPending(false);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success(isEdit ? "Address updated" : "Address added");
    onSuccess?.();
  };

  const defaults = address || {};

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Hidden fields for edit */}
      {isEdit && <input type="hidden" name="public_id" value={address.public_id} />}

      {/* Label */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Label</Label>
        <LabelPicker value={label} onChange={setLabel} />
      </div>

      {/* Full name + phone */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full Name" id="full_name" required error={errors.full_name}>
          <Input
            id="full_name"
            name="full_name"
            defaultValue={defaults.full_name || ""}
            placeholder="Rahul Sharma"
            required
          />
        </Field>
        <Field label="Phone" id="phone" required error={errors.phone}>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={defaults.phone || ""}
            placeholder="+91 98765 43210"
            required
          />
        </Field>
      </div>

      {/* Address lines */}
      <Field label="Address Line 1" id="address_line1" required error={errors.address_line1}>
        <Input
          id="address_line1"
          name="address_line1"
          defaultValue={defaults.address_line1 || ""}
          placeholder="House / Flat No., Building, Street"
          required
        />
      </Field>
      <Field label="Address Line 2" id="address_line2" error={errors.address_line2}>
        <Input
          id="address_line2"
          name="address_line2"
          defaultValue={defaults.address_line2 || ""}
          placeholder="Area, Colony (optional)"
        />
      </Field>

      {/* City / State / PIN */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="City" id="city" required error={errors.city}>
          <Input
            id="city"
            name="city"
            defaultValue={defaults.city || ""}
            placeholder="Ahmedabad"
            required
          />
        </Field>
        <Field label="State" id="state" required error={errors.state}>
          <Input
            id="state"
            name="state"
            defaultValue={defaults.state || ""}
            placeholder="Gujarat"
            required
          />
        </Field>
        <Field
          label="PIN Code"
          id="postal_code"
          required
          error={errors.postal_code}
          className="col-span-2 sm:col-span-1"
        >
          <Input
            id="postal_code"
            name="postal_code"
            defaultValue={defaults.postal_code || ""}
            placeholder="380054"
            maxLength={6}
            required
          />
        </Field>
      </div>

      {/* Landmark */}
      <Field label="Landmark" id="landmark" error={errors.landmark}>
        <Input
          id="landmark"
          name="landmark"
          defaultValue={defaults.landmark || ""}
          placeholder="Near Iscon Cross Road (optional)"
        />
      </Field>

      {/* Default checkbox */}
      <label className="flex cursor-pointer items-center gap-2.5">
        <input
          type="checkbox"
          name="is_default"
          value="true"
          defaultChecked={defaults.is_default || false}
          className="accent-primary size-4 rounded"
        />
        <span className="text-sm text-foreground">Set as default address</span>
      </label>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Saving..." : isEdit ? "Update Address" : "Save Address"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
