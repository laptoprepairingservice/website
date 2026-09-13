export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest Arrivals" },
  { value: "bestseller", label: "Best Selling" },
];

export const PRICE_PRESETS = [
  { label: "Under ₹5,000", min: "", max: "5000" },
  { label: "₹5,000 - ₹15,000", min: "5000", max: "15000" },
  { label: "₹15,000 - ₹50,000", min: "15000", max: "50000" },
  { label: "₹50,000 - ₹1,00,000", min: "50000", max: "100000" },
  { label: "Above ₹1,00,000", min: "100000", max: "" },
];
