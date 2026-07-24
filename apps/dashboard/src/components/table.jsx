"use client";

import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { useRouter } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "ui/components/table";
import ListLoader from "./react-list/loader";
import SortableHeader from "./react-list/sortable-header";
import { Button } from "ui/components/button";

export default function CommonTable({
  data = [],
  columns = [],
  onSort,
  href,
  onClick,
  linkProps,
  loader,
  rows,
  totals,
  showHeader = true,
  rowClassName = "p-1", // Add rowClassName prop
  sortBy,
  sortOrder,
  setState = () => { },
  getSubRows, // Function to extract sub-rows from a row (e.g., row => row.employees)
  enableAccordion = false, // Enable accordion functionality
  renderExpandedRow, // Function to render content when row is expanded: (row) => ReactNode
  expandedRowClassName = "", // Additional className for expanded row content
}) {
  // State to track which rows are expanded
  const router = useRouter();
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Toggle row expansion
  const toggleRowExpansion = (rowId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  };

  const currentSorting = useMemo(() => {
    if (sortBy) {
      return [
        {
          id: sortBy,
          desc: sortOrder === "desc",
        },
      ];
    }
    return [];
  }, [sortBy, sortOrder]);

  // Add expand column if accordion is enabled
  const tableColumns = useMemo(() => {
    if (!enableAccordion) return columns;

    return [
      {
        id: "_expand",
        header: "",
        size: 40,
        cell: ({ row }) => (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              toggleRowExpansion(row.id);
            }}
            variant="ghost"
            className={"p-1 size-8 hover:bg-muted"}
          >
            <Icon
              icon={"mdi:chevron-right"}
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                expandedRows.has(row.id) && "rotate-90"
              )}
            />
          </Button>
        ),
      },
      ...columns,
    ];
  }, [enableAccordion, columns, expandedRows]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableSorting: true,
    manualSorting: true,
    getCanSort: (column) => column.columnDef.sortable === true,
    state: {
      sorting: currentSorting,
    },
  });

  const handleRowClick = (e, rowData) => {
    // Ignore if clicking an interactive element inside the row
    if (
      e.target.closest(
        "a,button,input,select,textarea,label,[role='button'],[role='link'],[data-row-ignore]"
      )
    ) {
      return;
    }

    if (onClick) {
      onClick(rowData);
      return;
    }
    if (!href) return;
    const resolvedHref = typeof href === "function" ? href(rowData) : href;
    if (!resolvedHref) return;
    setState(rowData);
    router.push(resolvedHref);
  };

  const hasFooter = columns.some((col) => col?.footer);

  if (loader?.isLoading) return <ListLoader columns={columns} rows={rows} />;

  return (
    <div className="border-b">
      <Table>
        {showHeader && (
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="text-muted-foreground font-medium"
                    style={{ width: header.column.columnDef.size }}
                  // style={{
                  //   maxWidth: header.getSize(),
                  // }}
                  >
                    <SortableHeader column={header.column} onSort={onSort}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </SortableHeader>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
        )}
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const subRows = getSubRows ? getSubRows(row.original) : null;
            const hasSubRows = subRows && subRows.length > 0;
            const subRowCount = hasSubRows ? subRows.length : 1;

            // Helper to render cell content
            const renderCellContent = (cell, subRowData = null) => {
              const isSubRowColumn = cell.column.columnDef.meta?.subRowAccessor !== undefined;

              // For sub-row columns, override getValue to return the subRowData directly
              const context =
                subRowData && isSubRowColumn
                  ? {
                    ...cell.getContext(),
                    row: { ...cell.row, original: subRowData },
                    getValue: () => subRowData,
                  }
                  : cell.getContext();
              const content = flexRender(cell.column.columnDef.cell, context);
              return content;
            };

            if (!hasSubRows) {
              // Normal row rendering (no sub-rows)
              const isExpanded = expandedRows.has(row.id);

              return (
                <Fragment key={row.id}>
                  <TableRow
                    className={cn("group", (href || onClick) && "cursor-pointer", rowClassName)}
                    onClick={href || onClick ? (e) => handleRowClick(e, row.original) : undefined}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className={cn("whitespace-pre-wrap", rowClassName)}>
                        {renderCellContent(cell)}
                      </TableCell>
                    ))}
                  </TableRow>

                  {/* Render expanded row content */}
                  {enableAccordion && isExpanded && renderExpandedRow && (
                    <TableRow className={expandedRowClassName}>
                      <TableCell colSpan={tableColumns.length} className={expandedRowClassName}>
                        <div className="">{renderExpandedRow(row.original)}</div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              );
            }

            // Row with sub-rows: render first row + additional sub-rows
            return (
              <Fragment key={row.id}>
                {/* First row - includes all columns, with rowSpan for parent columns */}
                <TableRow className={cn("group")}>
                  {row.getVisibleCells().map((cell) => {
                    const meta = cell.column.columnDef.meta || {};
                    const shouldSpan = meta.spanRow === true;
                    const isSubRowColumn = meta.subRowAccessor !== undefined;

                    return (
                      <TableCell
                        key={cell.id}
                        rowSpan={shouldSpan ? subRowCount : undefined}
                        className={cn({ "p-0": href || onClick }, "whitespace-pre-wrap")}
                      >
                        {isSubRowColumn
                          ? renderCellContent(cell, subRows[0])
                          : renderCellContent(cell)}
                      </TableCell>
                    );
                  })}
                </TableRow>

                {/* Additional sub-rows - only render columns without spanRow */}
                {subRows.slice(1).map((subRowData, subIndex) => (
                  <TableRow key={`${row.id}-sub-${subIndex + 1}`} className={cn("group")}>
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta || {};
                      const shouldSpan = meta.spanRow === true;
                      const isSubRowColumn = meta.subRowAccessor !== undefined;

                      // Skip cells that are spanning from the first row
                      if (shouldSpan) return null;

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn({ "p-0": href || onClick }, "whitespace-pre-wrap")}
                        >
                          {isSubRowColumn ? renderCellContent(cell, subRowData) : null}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </Fragment>
            );
          })}
        </TableBody>
        {hasFooter && totals && (
          <TableFooter>
            <TableRow className="bg-muted/50 font-medium">
              {table.getHeaderGroups()[0].headers.map((header) => {
                const columnDef = header.column.columnDef;
                const footerContent = columnDef.footer
                  ? typeof columnDef.footer === "function"
                    ? columnDef.footer(totals)
                    : columnDef.footer
                  : "";

                return (
                  <TableCell key={header.id} className="font-semibold">
                    {footerContent}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableFooter>
        )}
      </Table>
    </div>
  );
}
