"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronRight, List } from "lucide-react";

/**
 * Sticky Table of Contents with IntersectionObserver active-heading tracking.
 * @param {{ headings: Array<{id: string, text: string, level: number}>, hasFaqs: boolean }} props
 */
export function BlogToc({ headings, hasFaqs }) {
  const [activeId, setActiveId] = useState("");
  const observerRef = useRef(null);

  useEffect(() => {
    if (!headings.length && !hasFaqs) return;

    const allIds = [...headings.map((h) => h.id), ...(hasFaqs ? ["blog-faqs"] : [])];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "0px 0px -55% 0px", threshold: 0 }
    );

    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings, hasFaqs]);

  if (!headings.length && !hasFaqs) return null;

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80; // account for sticky nav
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
      setActiveId(id);
    }
  };

  return (
    <nav aria-label="Table of contents">
      <p className="text-muted-foreground mb-3 flex items-center gap-2 text-sm font-bold tracking-widest uppercase">
        <List className="size-4" />
        On this page
      </p>

      <ul className="border-border/60 space-y-1 border-l">
        {headings.map((h) => {
          const isActive = activeId === h.id;
          const pl = h.level === 2 ? "pl-3" : h.level === 3 ? "pl-6" : "pl-9";
          return (
            <li key={h.id}>
              <button
                onClick={() => scrollTo(h.id)}
                className={`flex w-full items-start gap-2 py-1 pr-2 text-left text-sm leading-snug transition-colors ${pl} ${
                  isActive
                    ? "text-primary border-primary -ml-px border-l-2 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {h.text}
              </button>
            </li>
          );
        })}

        {hasFaqs && (
          <>
            <li className="mt-2 pt-2">
              <div className="border-border/60 mb-2 border-t" />
              <button
                onClick={() => scrollTo("blog-faqs")}
                className={`flex w-full items-center gap-1.5 py-1 pr-2 pl-3 text-left text-sm leading-snug transition-colors ${
                  activeId === "blog-faqs"
                    ? "text-primary border-primary -ml-px border-l-2 font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ChevronRight className="size-3 shrink-0" />
                Frequently Asked Questions
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
