"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { SectionHeader } from "./section-header";
import { formatPrice } from "@/lib/format";

const CPU_OPTIONS = [
  { name: "AMD Ryzen 9 7950X (16C/32T)", price: 42999, wattage: 170 },
  { name: "Intel Core i9-14900K (24C/32T)", price: 51999, wattage: 250 },
  { name: "AMD Ryzen 7 7700X (8C/16T)", price: 28999, wattage: 105 },
  { name: "Intel Core i5-14600K (14C/20T)", price: 29999, wattage: 125 },
];

const GPU_OPTIONS = [
  { name: "NVIDIA GeForce RTX 4090 24GB", price: 154999, wattage: 450 },
  { name: "MSI GeForce RTX 4070 Ti 12GB", price: 72999, wattage: 285 },
  { name: "ASUS Dual RTX 4060 8GB", price: 28999, wattage: 115 },
  { name: "Integrated Graphics (No Dedicated GPU)", price: 0, wattage: 0 },
];

const RAM_OPTIONS = [
  { name: "Corsair 32GB (2x16GB) DDR5 6000MHz", price: 12499, wattage: 15 },
  { name: "Corsair 64GB (2x32GB) DDR5 6000MHz", price: 22999, wattage: 25 },
  { name: "G.Skill 16GB (2x8GB) DDR5 5600MHz", price: 6999, wattage: 10 },
];

const STORAGE_OPTIONS = [
  { name: "Samsung 990 PRO 2TB NVMe SSD", price: 18999, wattage: 10 },
  { name: "WD Black SN850X 1TB NVMe SSD", price: 8999, wattage: 8 },
  { name: "Crucial P3 Plus 1TB NVMe SSD", price: 5499, wattage: 6 },
];

export function InteractivePCBuilderWidget() {
  const [selectedCpu, setSelectedCpu] = useState(CPU_OPTIONS[0]);
  const [selectedGpu, setSelectedGpu] = useState(GPU_OPTIONS[0]);
  const [selectedRam, setSelectedRam] = useState(RAM_OPTIONS[0]);
  const [selectedStorage, setSelectedStorage] = useState(STORAGE_OPTIONS[0]);

  const estimatedWattage =
    selectedCpu.wattage +
    selectedGpu.wattage +
    selectedRam.wattage +
    selectedStorage.wattage +
    100;

  const totalPrice =
    selectedCpu.price +
    selectedGpu.price +
    selectedRam.price +
    selectedStorage.price;

  const recommendedPsu =
    estimatedWattage > 650 ? "850W - 1000W 80+ Gold" : "650W - 750W 80+ Gold";

  return (
    <section className="border-b border-border py-10 lg:py-14">
      <div className="container">
        <SectionHeader
          title="Custom PC Configurator"
          description="Estimate system power draw and calculate component pricing for your custom rig."
          align="center"
        />

        <div className="mx-auto mt-6 max-w-4xl rounded-xl border border-border bg-card p-5 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left Selection Controls */}
            <div className="space-y-4 lg:col-span-7">
              {/* CPU */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Processor (CPU)
                </label>
                <select
                  value={selectedCpu.name}
                  onChange={(e) => {
                    const found = CPU_OPTIONS.find((c) => c.name === e.target.value);
                    if (found) setSelectedCpu(found);
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  {CPU_OPTIONS.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name} — {formatPrice(c.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* GPU */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Graphics Card (GPU)
                </label>
                <select
                  value={selectedGpu.name}
                  onChange={(e) => {
                    const found = GPU_OPTIONS.find((g) => g.name === e.target.value);
                    if (found) setSelectedGpu(found);
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  {GPU_OPTIONS.map((g) => (
                    <option key={g.name} value={g.name}>
                      {g.name} — {formatPrice(g.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* RAM */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Memory (RAM)
                </label>
                <select
                  value={selectedRam.name}
                  onChange={(e) => {
                    const found = RAM_OPTIONS.find((r) => r.name === e.target.value);
                    if (found) setSelectedRam(found);
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  {RAM_OPTIONS.map((r) => (
                    <option key={r.name} value={r.name}>
                      {r.name} — {formatPrice(r.price)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Storage */}
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-foreground">
                  Storage (NVMe SSD)
                </label>
                <select
                  value={selectedStorage.name}
                  onChange={(e) => {
                    const found = STORAGE_OPTIONS.find((s) => s.name === e.target.value);
                    if (found) setSelectedStorage(found);
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-foreground"
                >
                  {STORAGE_OPTIONS.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} — {formatPrice(s.price)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="flex flex-col justify-between rounded-lg border border-border bg-muted/30 p-5 lg:col-span-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-3 text-xs">
                  <span className="font-semibold text-foreground">Compatibility</span>
                  <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5" />
                    Verified Compatible
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Est. Power Draw:</span>
                    <span className="font-medium text-foreground">~{estimatedWattage} W</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Recommended PSU:</span>
                    <span className="font-medium text-foreground">{recommendedPsu}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Assembly &amp; Testing:</span>
                    <span className="font-medium text-foreground">Included Free</span>
                  </div>
                </div>

                <div className="mt-4 rounded-md border border-border bg-card p-3">
                  <p className="text-xs text-muted-foreground">Estimated Total (incl. GST):</p>
                  <p className="text-2xl font-bold text-foreground mt-0.5">
                    {formatPrice(totalPrice)}
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <Button className="w-full" asChild>
                  <Link href="/contact">
                    Request Build Consultation
                    <ArrowRight className="ml-1.5 size-4" />
                  </Link>
                </Button>
                <p className="mt-2 text-center text-[11px] text-muted-foreground">
                  Official GST invoice &amp; brand warranty included.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
