"use client";

import Link from "next/link";
import { Award, ShieldCheck, Truck, Wrench } from "lucide-react";
import SpotlightCard from "@/components/animation/spotlight-card";
import { SectionHeader } from "./section-header";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "100% Genuine Components",
    description:
      "Direct authorized partner with official GST tax invoice and manufacturer warranty.",
    spotlight: "rgba(139, 92, 246, 0.45)",
  },
  {
    icon: Truck,
    title: "Same-Day Dispatch",
    description:
      "Fast dispatch from our Ahmedabad warehouse. Free express shipping on orders over ₹5,000.",
    spotlight: "rgba(20, 184, 166, 0.45)",
  },
  {
    icon: Wrench,
    title: "Rig Compatibility Guaranteed",
    description:
      "Hardware engineers verify component compatibility for every order before shipping.",
    spotlight: "rgba(251, 191, 36, 0.45)",
  },
  {
    icon: Award,
    title: "18% GST Input Credit",
    description:
      "Official B2B GST invoices for businesses, developers, and creative production studios.",
    spotlight: "rgba(249, 115, 22, 0.45)",
  },
];

export function WhyChooseUs() {
  return (
    <section className="border-border border-b py-10 lg:py-14">
      <div className="container">
        <SectionHeader
          title="Why Choose Us"
          description="Gujarat's trusted computer hardware store for gaming rigs, AI workstations, and studio systems."
          align="center"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map(({ icon: Icon, title, description, spotlight }, idx) => (
            <SpotlightCard
              key={idx}
              spotlightColor={spotlight}
              className="flex flex-col gap-3 !rounded-xl !border-border !bg-card p-5"
            >
              <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
                <Icon className="size-5" />
              </div>
              <h3 className="text-sm font-semibold leading-snug text-foreground">{title}</h3>
              <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
            </SpotlightCard>
          ))}
        </div>
      </div>
    </section>
  );
}
