"use client";

import ReactList, {
  ReactListEmpty,
  ReactListError,
  ReactListInitialLoader,
  ReactListItems,
  ReactListPagination,
  ReactListProvider,
  ReactListSearch,
} from "@7span/react-list";
import Table from "../table";
import Empty from "./empty";
import Error from "./error";
import ListLoader from "./loader";
import Pagination from "./pagination";
import ListSearch from "./search";

// import { EvtHeader } from "components/header";
import requestHandler from "@/lib/request-handler";
import { createReactListStateManager } from "./react-list-state-manager";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "ui/components/button";
// import { usePortal } from "@/hooks/usePortal";
import { Badge } from "ui/components/badge";
import FilterSidebar from "./filter-sidebar";

export default function List({
  endpoint,
  columns = [],
  children,
  title,
  className,
  shimmer,
  showHeader = true,
  hidePagination = false,
  showSearch = true,
  page = 1,
  rowClassName,
  perPage = 25,
  search = "",
  sortBy = "created_at",
  sortOrder = "desc",
  href = () => {},
  onClick,
  renderFilters,
  searchPlaceholder = "Search",
  meta = {},
  teleportFilterButton = false,
  filters = {},
  onDataChange = () => {},
  onResponseChange = () => {},
  refetch = () => {},
  storageKey,
  version = "",
  persistState = false,
  teleportFilters,
  hideFilterButton = false,
  showListHeader = true,
  onFiltersChange,
  renderContent = () => {},
  inlineFilters = false,
  enableAccordion = false, // Enable accordion functionality
  renderExpandedRow, // Function to render content when row is expanded
  expandedRowClassName = "", // Additional className for expanded row content
  addItemSlot, // Add Item UI Component
}) {
  // const uiActionPortal = usePortal({ elementId: HERA_FERI });
  const [isOpen, setIsOpen] = useState(false);
  const shouldPersist = persistState ?? false;
  const stateManager = useMemo(
    () => (shouldPersist ? createReactListStateManager() : undefined),
    [shouldPersist]
  );
  const reactListVersion = storageKey ? `${storageKey}-${version}` : undefined;

  return (
    <ReactListProvider
      config={{
        requestHandler: requestHandler(),
        ...(stateManager && { stateManager }),
      }}
    >
      <ReactList
        title={title}
        endpoint={endpoint}
        search={search}
        page={page}
        filters={filters}
        perPage={perPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        showHeader={showHeader}
        paginationMode="pagination"
        version={reactListVersion}
        meta={meta}
      >
        {({
          filters: currentFilters,
          setSort,
          setFilters,
          count,
          loader,
          sort: { sortBy, sortOrder },
          data,
          hasActiveFilters,
          clearFilters,
          response,
          refresh,
        }) => {
          useEffect(() => {
            if (data && data.length > 0) {
              onDataChange(data);
            }
          }, [data, onDataChange]);

          useEffect(() => {
            if (response) {
              onResponseChange(response);
            }
          }, [response, onDataChange]);

          useEffect(() => {
            if (onFiltersChange) {
              onFiltersChange(currentFilters);
            }
          }, [currentFilters, onFiltersChange]);

          useEffect(() => {
            if (typeof refetch === "function") {
              refetch(() => refresh);
            }
          }, [refetch]);

          return (
            <div className="flex-1 overflow-auto">
              {!teleportFilterButton && showListHeader && title ? (
                <div className={cn("bg-background space-y-4 py-4 sm:space-y-0 sm:py-4", className)}>
                  {/* Mobile: stacked layout; Desktop: title left, actions right */}
                  <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                    <div className="w-full md:w-auto">
                      <h1 className="font-display text-xl font-semibold tracking-tight sm:text-3xl">
                        {title}
                      </h1>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                      {showSearch ? (
                        <div className="w-full min-w-0 sm:w-80">
                          <ReactListSearch>
                            {(props) => (
                              <ListSearch
                                {...props}
                                searchPlaceholder={searchPlaceholder}
                                fluid={true}
                              />
                            )}
                          </ReactListSearch>
                        </div>
                      ) : null}
                      {inlineFilters &&
                        renderFilters({
                          setIsOpen,
                          filters: currentFilters,
                          setFilters,
                          isOpen,
                          defaultFilters: filters,
                          clearFilters,
                        })}
                      {addItemSlot ? <div className="w-full sm:w-auto">{addItemSlot}</div> : null}
                      {renderFilters &&
                      !hideFilterButton &&
                      !teleportFilterButton &&
                      !inlineFilters ? (
                        <Button
                          variant="outline"
                          onClick={() => setIsOpen(true)}
                          className="flex w-full items-center gap-2 sm:w-auto"
                        >
                          <div className="relative shrink-0">
                            <Icon icon="mdi:filter" className="size-4" />
                            {hasActiveFilters && (
                              <span className="bg-primary absolute -top-1 -right-1 size-2 rounded-full" />
                            )}
                          </div>
                          Filters
                          {hasActiveFilters && (
                            <Badge className="ml-1 px-1.5">
                              {
                                Object.keys(currentFilters).filter(
                                  (key) =>
                                    currentFilters[key] !== null &&
                                    currentFilters[key] !== undefined &&
                                    currentFilters[key] !== ""
                                ).length
                              }
                            </Badge>
                          )}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : null}
              {renderContent()}
              <div
                className={cn(
                  {
                    "p-4 sm:p-6": !teleportFilterButton && !showListHeader,
                  },
                  className
                )}
              >
                <ReactListInitialLoader>
                  {shimmer ? (
                    shimmer
                  ) : (
                    <ListLoader
                      columns={columns}
                      rows={!isNaN(perPage) ? perPage : 10}
                      showHeader={showHeader}
                    />
                  )}
                </ReactListInitialLoader>

                <ReactListEmpty>
                  <Empty title={"No data found"} />
                </ReactListEmpty>

                <ReactListError>
                  {({ error }) => {
                    return <Error error={error} />;
                  }}
                </ReactListError>

                <ReactListItems>
                  {({ items }) => {
                    if (columns.length === 0 && children) {
                      return children({ items });
                    }
                    return (
                      <Table
                        data={items}
                        columns={columns}
                        onSort={setSort}
                        href={href}
                        onClick={onClick}
                        rows={perPage}
                        loader={loader}
                        showHeader={showHeader}
                        rowClassName={rowClassName} // Add this line to set row height
                        refresh={refresh}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        enableAccordion={enableAccordion}
                        renderExpandedRow={renderExpandedRow}
                        expandedRowClassName={expandedRowClassName}
                      />
                    );
                  }}
                </ReactListItems>
                {perPage > 0 && !hidePagination && (
                  <ReactListPagination>
                    {(props) => {
                      return props.pagesCount < 2 ? null : <Pagination {...props} />;
                    }}
                  </ReactListPagination>
                )}
              </div>
              {renderFilters
                ? teleportFilters
                  ? // uiActionPortal &&
                    {}
                  : // createPortal(
                    //   renderFilters({
                    //     setIsOpen,
                    //     filters: currentFilters,
                    //     setFilters,
                    //     isOpen,
                    //     defaultFilters: filters,
                    //     clearFilters,
                    //   }),
                    //   uiActionPortal
                    // )
                    !inlineFilters && (
                      <FilterSidebar
                        open={isOpen}
                        onOpenChange={setIsOpen}
                        filters={currentFilters}
                        setFilters={setFilters}
                        clearFilters={clearFilters}
                        defaultFilters={filters}
                        hasActiveFilters={hasActiveFilters}
                        renderFilters={renderFilters}
                      />
                    )
                : null}
            </div>
          );
        }}
      </ReactList>
    </ReactListProvider>
  );
}
