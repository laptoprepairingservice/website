import { Icon } from "@iconify/react";
import { Button } from "ui/components/button";

export default function SortableHeader({ column, children, onSort }) {
  const isSortable = column.columnDef.sortable === true;
  if (!isSortable) {
    return <>{children}</>;
  }

  const sorted = column.getIsSorted();

  const handleSort = () => {
    const currentSorted = column.getIsSorted();

    const newSortOrder =
      currentSorted === "asc"
        ? "desc"
        : currentSorted === "desc"
          ? null
          : "asc";

    if (newSortOrder === null) {
      column.clearSorting();
    } else {
      column.toggleSorting(newSortOrder === "desc");
    }
    if (onSort) {
      onSort({ by: column.id, order: newSortOrder });
    }
  };

  const sortIcon = () => {
    if (sorted === "asc") {
      return "mdi:chevron-up";
    } else if (sorted === "desc") {
      return "mdi:chevron-down";
    } else {
      return "mdi:chevron-up-down";
    }
  };

  return (
    <Button
      variant="ghost"
      className="-ml-2.5 flex items-center gap-1 cursor-pointer select-none group"
      onClick={handleSort}
    >
      <span>{children}</span>
      <Icon
        icon={sortIcon()}
        className={
          sorted
            ? "opacity-100"
            : "opacity-0 group-hover:opacity-100 transition-opacity"
        }
      />
    </Button>
  );
}
