"use client";

import { useState } from "react";
import {
  ChevronDown,
  Cpu,
  FileText,
  Laptop,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";
import { Badge } from "@ui/shadcn/components/badge";
import { StarRating } from "@/components/store/star-rating";
import { cn } from "@/lib/utils";

function AccordionSection({
  id,
  title,
  icon: Icon,
  badge,
  isOpen,
  onToggle,
  children,
}) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-2xl border shadow-2xs transition-colors">
      <button
        type="button"
        id={`accordion-header-${id}`}
        aria-controls={`accordion-content-${id}`}
        aria-expanded={isOpen}
        onClick={onToggle}
        className="hover:bg-muted/30 flex w-full items-center justify-between gap-4 p-5 text-left transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="bg-primary/10 text-primary flex size-8 items-center justify-center rounded-lg">
              <Icon className="size-4" />
            </div>
          )}
          <h2 className="text-base font-semibold text-foreground sm:text-lg">
            {title}
          </h2>
          {badge}
        </div>

        <div
          className={cn(
            "text-muted-foreground flex size-8 items-center justify-center rounded-full transition-transform duration-200",
            isOpen && "rotate-180 text-foreground"
          )}
        >
          <ChevronDown className="size-5" />
        </div>
      </button>

      {isOpen && (
        <div
          id={`accordion-content-${id}`}
          role="region"
          aria-labelledby={`accordion-header-${id}`}
          className="border-t border-border/70 p-5 sm:p-6"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function ProductTabs({ product }) {
  const hasCompatibility = Boolean(
    product.compatibility ||
      (product.compatibilityList && product.compatibilityList.length > 0)
  );

  const rawCompatList =
    product.compatibilityList && product.compatibilityList.length > 0
      ? product.compatibilityList
      : product.compatibility
      ? product.compatibility
          .split(/[\n,]+/)
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const [compatSearch, setCompatSearch] = useState("");

  // Sections open state (Description & Specifications open by default for back-to-back reading)
  const [openSections, setOpenSections] = useState({
    description: true,
    specifications: true,
    compatibility: true,
    reviews: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredCompatModels = compatSearch.trim()
    ? rawCompatList.filter((m) =>
        m.toLowerCase().includes(compatSearch.toLowerCase().trim())
      )
    : rawCompatList;

  const hasSpecs = Boolean(
    product.specifications ||
      (product.specs && Object.keys(product.specs).length > 0)
  );

  return (
    <div className="mt-14 space-y-4 border-t border-border pt-10 lg:mt-20">
      {/* 1. Description Section */}
      <AccordionSection
        id="description"
        title="Product Description"
        icon={FileText}
        isOpen={openSections.description}
        onToggle={() => toggleSection("description")}
      >
        <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
          {product.description ? (
            <div dangerouslySetInnerHTML={{ __html: product.description }} />
          ) : (
            <p>{product.shortDescription || "No detailed description provided for this product."}</p>
          )}
        </div>
      </AccordionSection>

      {/* 2. Technical Specifications Section */}
      <AccordionSection
        id="specifications"
        title="Technical Specifications"
        icon={Cpu}
        badge={
          hasSpecs ? (
            <Badge variant="secondary" className="text-xs font-normal">
              Detailed
            </Badge>
          ) : null
        }
        isOpen={openSections.specifications}
        onToggle={() => toggleSection("specifications")}
      >
        <div className="space-y-4">
          {product.specifications ? (
            <div
              className="prose dark:prose-invert max-w-none text-foreground [&_table]:w-full [&_table]:border-collapse [&_table]:border [&_table]:border-border [&_table]:rounded-xl [&_table]:overflow-hidden [&_th]:border [&_th]:border-border [&_th]:bg-muted/70 [&_th]:p-3.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-xs [&_th]:uppercase [&_td]:border [&_td]:border-border [&_td]:p-3.5 [&_td]:text-sm [&_tr:nth-child(even)]:bg-muted/20"
              dangerouslySetInnerHTML={{ __html: product.specifications }}
            />
          ) : product.specs && Object.entries(product.specs).length > 0 ? (
            <dl className="grid gap-3 sm:grid-cols-2">
              {Object.entries(product.specs).map(([key, value]) => (
                <div
                  key={key}
                  className="border-border bg-card/60 flex justify-between rounded-xl border p-4 shadow-2xs"
                >
                  <dt className="text-muted-foreground text-sm capitalize">
                    {key.replace("-", " ")}
                  </dt>
                  <dd className="text-sm font-semibold text-foreground">
                    {String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              Technical specifications will be updated shortly.
            </div>
          )}
        </div>
      </AccordionSection>

      {/* 3. Compatibility Section */}
      {hasCompatibility && (
        <AccordionSection
          id="compatibility"
          title="Device & Model Compatibility"
          icon={Laptop}
          badge={
            rawCompatList.length > 0 ? (
              <Badge variant="outline" className="text-xs font-normal">
                {rawCompatList.length} models
              </Badge>
            ) : null
          }
          isOpen={openSections.compatibility}
          onToggle={() => toggleSection("compatibility")}
        >
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-muted/30 p-4 sm:p-5 rounded-xl border border-border">
              <div>
                <h3 className="font-semibold text-foreground text-sm sm:text-base">
                  Supported Laptop Models
                </h3>
                <p className="text-muted-foreground text-xs mt-0.5">
                  Search below to quickly verify whether this part fits your device model.
                </p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <input
                  type="text"
                  value={compatSearch}
                  onChange={(e) => setCompatSearch(e.target.value)}
                  placeholder="Search model (e.g. Inspiron 3521)..."
                  className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                />
              </div>
            </div>

            {filteredCompatModels.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {filteredCompatModels.map((model, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2.5 border border-border/70 bg-card rounded-xl px-3.5 py-2.5 text-xs font-medium text-foreground hover:border-primary/50 transition-colors shadow-2xs"
                  >
                    <span className="size-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="truncate">{model}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                {compatSearch
                  ? `No compatible models found matching "${compatSearch}".`
                  : "No compatible models specified."}
              </div>
            )}

            <div className="flex items-start gap-3 text-xs text-muted-foreground bg-primary/5 border border-primary/20 rounded-xl p-4">
              <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">Need fitment assistance? </span>
                Not sure if this part is compatible with your laptop motherboard or screen connector? Contact our hardware technicians in Ahmedabad with your model or serial number for free fitment verification before ordering.
              </div>
            </div>
          </div>
        </AccordionSection>
      )}

      {/* 4. Reviews Section */}
      <AccordionSection
        id="reviews"
        title="Ratings & Reviews"
        icon={Star}
        badge={
          product.rating ? (
            <Badge variant="secondary" className="text-xs font-semibold">
              ★ {Number(product.rating).toFixed(1)}
            </Badge>
          ) : null
        }
        isOpen={openSections.reviews}
        onToggle={() => toggleSection("reviews")}
      >
        <div className="space-y-6">
          <div className="flex items-center gap-5 border-b border-border pb-6">
            <span className="text-4xl font-bold tracking-tight text-foreground">
              {product.rating ? Number(product.rating).toFixed(1) : "5.0"}
            </span>
            <div>
              <StarRating
                rating={product.rating}
                showCount={false}
                size="md"
              />
              <p className="text-muted-foreground mt-1 text-xs">
                Based on {product.reviewCount || 0} customer ratings
              </p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">
            Verified customer reviews and feedback will be displayed here.
          </p>
        </div>
      </AccordionSection>
    </div>
  );
}

// Named alias
export { ProductTabs as ProductSections };
