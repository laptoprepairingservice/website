"use client";

import { useCallback, useMemo, useState } from "react";

import List from "@/components/react-list";
import { BrandSheetForm } from "./_components/brand-sheet-form";
import { Button } from "@ui/shadcn/components/button";

export default function BrandsPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "slug", header: "Slug" },
      {
        accessorKey: "website_url",
        header: "Website",
        cell: ({ row }) => row.original.website_url || "—",
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (row.original.is_active ? "Active" : "Inactive"),
      },
    ],
    []
  );

  function openCreate() {
    setSelectedBrand(null);
    setSheetOpen(true);
  }

  function openEdit(brand) {
    setSelectedBrand(brand);
    setSheetOpen(true);
  }

  return (
    <>
      <List
        key={refreshToken}
        title="Brands"
        endpoint="brands"
        select="id, name, slug, logo_path, website_url, description, is_active, created_at"
        columns={columns}
        searchPlaceholder="Search brands"
        meta={{ search: "name" }}
        sortBy="name"
        sortOrder="asc"
        addItemSlot={
          <Button type="button" onClick={openCreate}>
            Add brand
          </Button>
        }
        onClick={(row) => openEdit(row)}
      />

      <BrandSheetForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        brand={selectedBrand}
        onSuccess={handleRefresh}
      />
    </>
  );
}
