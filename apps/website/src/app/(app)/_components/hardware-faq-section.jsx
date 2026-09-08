"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { SectionHeader } from "./section-header";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How fast is delivery in Ahmedabad and across Gujarat?",
    a: "Orders in Ahmedabad placed before 3:00 PM are eligible for same-day delivery or store pickup. Other Gujarat cities receive express insured delivery within 24 to 48 hours.",
  },
  {
    q: "Are all components 100% genuine with manufacturer warranty?",
    a: "Yes. We are authorized direct partners for Intel, AMD, NVIDIA, ASUS, MSI, Corsair, Samsung, and Western Digital. All orders include official GST tax invoices for warranty claims.",
  },
  {
    q: "Can you help verify component compatibility or build my custom PC?",
    a: "Yes. Our hardware engineers review every custom parts list for socket, BIOS, RAM clearance, and PSU wattage compatibility. Professional assembly and stress-testing are available.",
  },
  {
    q: "Can I receive an 18% GST tax invoice for business input credit?",
    a: "Yes. Simply provide your company GSTIN and billing address at checkout to receive an official B2B tax invoice to claim input tax credit (ITC).",
  },
  {
    q: "What payment and EMI options do you offer?",
    a: "We accept UPI, Net Banking, Credit/Debit cards, and No-Cost EMI options on major bank cards, as well as Cash on Delivery for eligible Ahmedabad locations.",
  },
];

export function HardwareFAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="border-b border-border py-10 lg:py-14">
      <div className="container">
        <SectionHeader
          title="Frequently Asked Questions"
          description="Common questions about warranty, custom builds, delivery, and payments."
          align="center"
        />

        <div className="mx-auto mt-6 max-w-3xl space-y-2.5">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-lg border border-border bg-card overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-semibold text-foreground hover:text-foreground/80 transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180 text-foreground"
                    )}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-border px-4 py-3 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
