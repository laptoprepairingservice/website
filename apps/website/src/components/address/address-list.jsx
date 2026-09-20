"use client";

import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@ui/shadcn/components/dialog";
import { AddressCard } from "./address-card";
import { AddressForm } from "./address-form";

// ─── AddressList ──────────────────────────────────────────────────────────────

/**
 * Renders a list of user addresses.
 * In selectable mode (checkout) — shows radio-style selection.
 * In manage mode (account) — shows full CRUD controls.
 *
 * @param {Array}    addresses       - Array of address objects from DB
 * @param {boolean}  selectable      - Checkout mode: allow selecting one address
 * @param {string}   selectedId      - public_id of currently selected address
 * @param {Function} onSelect        - Called with address when selected
 * @param {boolean}  showActions     - Account mode: show edit/delete actions
 * @param {Function} onMutated       - Called after add/edit/delete to trigger refetch
 */
export function AddressList({
  addresses = [],
  selectable = false,
  selectedId,
  onSelect,
  showActions = true,
  onMutated,
}) {
  const [dialogMode, setDialogMode] = useState(null); // null | 'add' | 'edit'
  const [editingAddress, setEditingAddress] = useState(null);

  const openAdd = () => {
    setEditingAddress(null);
    setDialogMode("add");
  };

  const openEdit = (address) => {
    setEditingAddress(address);
    setDialogMode("edit");
  };

  const closeDialog = () => {
    setDialogMode(null);
    setEditingAddress(null);
  };

  const handleSuccess = () => {
    closeDialog();
    onMutated?.();
  };

  return (
    <>
      {/* Address grid */}
      {addresses.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((addr) => (
            <AddressCard
              key={addr.public_id}
              address={addr}
              selectable={selectable}
              selected={selectable && selectedId === addr.public_id}
              onSelect={() => onSelect?.(addr)}
              showActions={showActions}
              onEdit={openEdit}
              onDeleted={onMutated}
              onDefaultSet={onMutated}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted">
            <MapPin className="size-6 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">No addresses saved</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Add a delivery address to get started
            </p>
          </div>
        </div>
      )}

      {/* Add new address button */}
      <Button
        type="button"
        variant="outline"
        className="mt-3 w-full gap-2"
        onClick={openAdd}
      >
        <Plus className="size-4" />
        Add New Address
      </Button>

      {/* Add / Edit dialog */}
      <Dialog open={Boolean(dialogMode)} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{dialogMode === "edit" ? "Edit Address" : "Add New Address"}</DialogTitle>
          </DialogHeader>
          <AddressForm
            address={editingAddress}
            onSuccess={handleSuccess}
            onCancel={closeDialog}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
