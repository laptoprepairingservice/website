/**
 * Barrel export for product filter components.
 * Subcomponents are split into atomic files for readability, maintainability, and scalability:
 * - filter-constants.js: SORT_OPTIONS, PRICE_PRESETS
 * - filter-accordion.jsx: FilterAccordion
 * - filter-form-content.jsx: FilterFormContent
 * - mobile-filter-header.jsx: MobileFilterHeader (tiny header button + slide-out Sheet)
 * - desktop-filters.jsx: DesktopProductFilters
 * - category-pills-bar.jsx: CategoryPillsBar
 * - active-filter-chips.jsx: ActiveFilterChips
 */

export { MobileFilterHeader } from "./mobile-filter-header";
export { CategoryPillsBar } from "./category-pills-bar";
export {
  DesktopProductFilters,
  DesktopProductFilters as ProductFilters,
} from "./desktop-filters";
export { ActiveFilterChips } from "./active-filter-chips";
export { FilterFormContent } from "./filter-form-content";
export { FilterAccordion } from "./filter-accordion";
export { SORT_OPTIONS, PRICE_PRESETS } from "./filter-constants";
