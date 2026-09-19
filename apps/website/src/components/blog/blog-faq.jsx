"use client";

import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

function FaqItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  const contentRef = useRef(null);

  const toggle = () => setOpen((prev) => !prev);

  return (
    <div
      className={`rounded-xl border transition-colors duration-300 ${
        open ? "border-primary/30 bg-primary/5" : "bg-muted/20 hover:bg-muted/40"
      }`}
    >
      {/* Header / trigger */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={`faq-body-${index}`}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-lg font-semibold select-none"
      >
        <span>{faq.question}</span>
        <ChevronDown
          className={`text-muted-foreground size-4 shrink-0 transition-transform duration-300 ease-in-out ${
            open ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      {/* Animated body */}
      <div
        id={`faq-body-${index}`}
        ref={contentRef}
        style={{
          maxHeight: open ? `${contentRef.current?.scrollHeight ?? 0}px` : "0px",
          overflow: "hidden",
          transition: "max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <p className="text-muted-foreground px-4 pb-4 leading-relaxed">{faq.answer}</p>
      </div>
    </div>
  );
}

/**
 * Animated FAQ accordion for the blog detail page.
 * @param {{ faqs: Array<{question: string, answer: string}> }} props
 */
export function BlogFaqAccordion({ faqs }) {
  if (!faqs?.length) return null;

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <FaqItem key={i} faq={faq} index={i} />
      ))}
    </div>
  );
}
