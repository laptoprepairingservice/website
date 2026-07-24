import Link from "next/link";
import { Truck } from "lucide-react";
import { STORE } from "@/lib/store-config";

export function AnnouncementBar() {
  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container-store flex h-10 items-center justify-center gap-2 text-xs sm:text-sm">
        <Truck className="size-3.5 shrink-0" aria-hidden />
        <p>
          Free shipping on orders above{" "}
          {new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
          }).format(STORE.freeShippingThreshold)}{" "}
          across Ahmedabad
          <span className="mx-2 hidden sm:inline">·</span>
          <Link href="/products" className="hidden underline-offset-2 hover:underline sm:inline">
            Shop Now
          </Link>
        </p>
      </div>
    </div>
  );
}
