import { Award, ShieldCheck, Truck, Wrench } from "lucide-react";
import { SectionHeader } from "./section-header";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "100% Genuine Components",
    description: "Direct authorized partner with official GST tax invoice and manufacturer warranty.",
  },
  {
    icon: Truck,
    title: "Same-Day Dispatch",
    description: "Fast dispatch from our Ahmedabad warehouse. Free express shipping on orders over ₹5,000.",
  },
  {
    icon: Wrench,
    title: "Rig Compatibility Guaranteed",
    description: "Hardware engineers verify component compatibility for every order before shipping.",
  },
  {
    icon: Award,
    title: "18% GST Input Credit",
    description: "Official B2B GST invoices for businesses, developers, and creative production studios.",
  },
];

export function WhyChooseUs() {
  return (
    <section className="border-b border-border bg-muted/20 py-10 lg:py-14">
      <div className="container">
        <SectionHeader
          title="Why Choose Us"
          description="Gujarat's trusted computer hardware store for gaming rigs, AI workstations, and studio systems."
          align="center"
        />

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TRUST_POINTS.map(({ icon: Icon, title, description }, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="mb-3 flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50 text-foreground">
                <Icon className="size-5" />
              </div>
              <h3 className="text-sm font-semibold text-foreground leading-snug">
                {title}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
