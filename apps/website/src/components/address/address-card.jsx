"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Home, MapPin, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { Badge } from "@ui/shadcn/components/badge";
import {
  deleteAddressAction,
  setDefaultAddressAction,
} from "@/app/(app)/account/addresses/_actions/address-actions";

// ─── Label icon map ───────────────────────────────────────────────────────────

function LabelIcon({ label }) {
  if (label?.toLowerCase() === "home") return <Home className="size-3.5" />;
  if (label?.toLowerCase() === "work") return <Star className="size-3.5" />;
  return <MapPin className="size-3.5" />;
}

// ─── AddressCard ──────────────────────────────────────────────────────────────

/**
 * Single address card — selectable (checkout), or standalone (account).
 *
 * @param {Object}   address       - Address data
 * @param {boolean}  selectable    - Show a radio/check selection ring (checkout mode)
 * @param {boolean}  selected      - Whether this card is currently selected
 * @param {Function} onSelect      - Called when card is clicked in selectable mode
 * @param {Function} onEdit        - Called when edit is clicked (passes address)
 * @param {boolean}  showActions   - Show edit/delete/default buttons (account mode)
 * @param {Function} onDeleted     - Called after successful delete
 * @param {Function} onDefaultSet  - Called after setting as default
 */
export function AddressCard({
  address,
  selectable = false,
  selected = false,
  onSelect,
  onEdit,
  showActions = true,
  onDeleted,
  onDefaultSet,
}) {
  const [deleting, setDeleting] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this address?")) return;
    setDeleting(true);
    const result = await deleteAddressAction(address.public_id);
    setDeleting(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Address deleted");
    onDeleted?.();
  };

  const handleSetDefault = async () => {
    setSettingDefault(true);
    const result = await setDefaultAddressAction(address.public_id);
    setSettingDefault(false);
    if (result?.error) {
      toast.error(result.error);
      return;
    }
    toast.success("Default address updated");
    onDefaultSet?.();
  };

  const cardClass = `
    relative rounded-xl border p-4 transition-all duration-200
    ${selectable ? "cursor-pointer" : ""}
    ${selected
      ? "border-primary bg-primary/5 shadow-sm ring-2 ring-primary/30"
      : "border-border bg-card hover:border-border/80"
    }
  `;

  return (
    <div className={cardClass} onClick={selectable ? onSelect : undefined}>
      {/* Top row: label + default badge + selection indicator */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Label pill */}
          {address.label && (
            <span className="flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              <LabelIcon label={address.label} />
              {address.label}
            </span>
          )}
          {address.is_default && (
            <Badge variant="secondary" className="text-xs">
              Default
            </Badge>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {/* Selection check */}
          {selectable && (
            <div
              className={`flex size-5 items-center justify-center rounded-full border-2 transition-all ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border"
              }`}
            >
              {selected && <Check className="size-3" />}
            </div>
          )}

          {/* Actions menu */}
          {showActions && (
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-7 p-0 text-muted-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen((v) => !v);
                }}
              >
                <MoreVertical className="size-4" />
              </Button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 min-w-[160px] rounded-xl border border-border bg-popover p-1 shadow-lg">
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        onEdit?.(address);
                      }}
                    >
                      <Pencil className="size-3.5" /> Edit
                    </button>
                    {!address.is_default && (
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent disabled:opacity-50"
                        disabled={settingDefault}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenuOpen(false);
                          handleSetDefault();
                        }}
                      >
                        <Star className="size-3.5" />
                        {settingDefault ? "Setting..." : "Set as Default"}
                      </button>
                    )}
                    <button
                      type="button"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      disabled={deleting}
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(false);
                        handleDelete();
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Address content */}
      <div className="mt-3 space-y-0.5 text-sm">
        <p className="font-semibold text-foreground">{address.full_name}</p>
        <p className="text-muted-foreground">{address.phone}</p>
        <p className="mt-1.5 text-muted-foreground">
          {address.address_line1}
          {address.address_line2 ? `, ${address.address_line2}` : ""}
        </p>
        {address.landmark && (
          <p className="text-muted-foreground">Near {address.landmark}</p>
        )}
        <p className="text-muted-foreground">
          {[address.city, address.state].filter(Boolean).join(", ")}
          {address.postal_code ? ` — ${address.postal_code}` : ""}
        </p>
      </div>
    </div>
  );
}
