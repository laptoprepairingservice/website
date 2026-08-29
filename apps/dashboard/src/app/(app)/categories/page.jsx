"use client";

import { useCallback, useMemo, useState } from "react";

import List from "@/components/react-list";
import { CategorySheetForm } from "./_components/category-sheet-form";
import { Button } from "@ui/shadcn/components/button";

export default function CategoriesPage() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshToken((value) => value + 1);
  }, []);

  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "slug", header: "Slug" },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (row.original.is_active ? "Active" : "Inactive"),
      },
    ],
    []
  );

  function openCreate() {
    setSelectedCategory(null);
    setSheetOpen(true);
  }

  function openEdit(category) {
    setSelectedCategory(category);
    setSheetOpen(true);
  }

  return (
    <>
      <List
        key={refreshToken}
        title="Categories"
        endpoint="categories"
        select="id, name, slug, parent_id, description, image_path, sort_order, is_active, meta_title, meta_description, created_at"
        columns={columns}
        searchPlaceholder="Search categories"
        meta={{ search: "name" }}
        sortBy="sort_order"
        sortOrder="asc"
        addItemSlot={
          <Button type="button" onClick={openCreate}>
            Add category
          </Button>
        }
        onClick={(row) => openEdit(row)}
      />

      <CategorySheetForm
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        category={selectedCategory}
        onSuccess={handleRefresh}
      />
    </>
  );
}
