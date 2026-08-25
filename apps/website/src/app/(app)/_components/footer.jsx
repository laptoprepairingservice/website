import Link from "next/link";
import { Facebook, Instagram, Mail, MapPin, Phone, Twitter, Youtube } from "lucide-react";
import { STORE } from "@/lib/store-config";

const FOOTER_LINKS = {
  shop: [
    { label: "All Products", href: "/products" },
    { label: "Processors", href: "/products?category=processors" },
    { label: "Graphics Cards", href: "/products?category=graphics-cards" },
    { label: "Monitors", href: "/products?category=monitors" },
    { label: "Peripherals", href: "/products?category=peripherals" },
  ],
  support: [
    { label: "Contact Us", href: "/contact" },
    { label: "Return Policy", href: "/returns" },
    { label: "Order Tracking", href: "/account/tracking" },
    { label: "FAQ", href: "/contact#faq" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
  ],
};

const SOCIAL = [
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function Footer() {
  return (
    <footer className="border-border bg-muted/30 border-t">
      <div className="">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg text-sm font-bold">
                CV
              </div>
              <span className="text-lg font-semibold">{STORE.name}</span>
            </Link>
            <p className="text-muted-foreground mt-4 max-w-sm text-sm">
              Ahmedabad&apos;s trusted destination for premium computer hardware. Genuine products,
              expert support, and fast delivery across Gujarat.
            </p>
            <div className="text-muted-foreground mt-6 space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0" />
                {STORE.address}
              </p>
              <p className="flex items-center gap-2">
                <Phone className="size-4 shrink-0" />
                {STORE.phone}
              </p>
              <p className="flex items-center gap-2">
                <Mail className="size-4 shrink-0" />
                {STORE.email}
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="border-border bg-background hover:bg-accent flex size-9 items-center justify-center rounded-lg border transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold tracking-wider uppercase">{title}</h3>
              <ul className="mt-4 space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-border mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} {STORE.name}. All rights reserved. GSTIN: {STORE.gstin}
          </p>
          <div className="text-muted-foreground flex gap-4 text-xs">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/returns" className="hover:text-foreground">
              Returns
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
