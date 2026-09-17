import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { STORE } from "@/lib/store-config";
import { ThemeToggle } from "../theme-toggle";

const FOOTER_LINKS = {
  "Quick Links": [
    { label: "Home", href: "/" },
    { label: "All Products", href: "/search" },
    { label: "About Us", href: "/about" },
    { label: "Blog", href: "/blogs" },
  ],
  "Customer Care": [
    { label: "Contact Us", href: "/contact" },
    { label: "FAQ", href: "/contact#faq" },
    { label: "Return Policy", href: "/returns" },
    { label: "Order Tracking", href: "/account/tracking" },
  ],
  "Company Links": [
    { label: "Help & Support", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Contact Us", href: "/contact" },
  ],
};

const SOCIAL = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
];

export function Footer() {
  return (
    <footer className="border-border bg-muted/30 overflow-hidden border-t">
      <div className="container py-10 lg:py-14">
        {/* ── ROW 1: Brand (left) | Newsletter (right) ── */}
        <div className="border-border grid gap-10 border-b pb-10 md:grid-cols-2">
          {/* Left: Logo + description */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg text-sm font-bold">
                RJ
              </div>
              <span className="text-xl font-bold tracking-tight">{STORE.name}</span>
            </Link>
            <p className="text-muted-foreground mt-4 max-w-sm text-sm leading-relaxed">
              Ahmedabad&apos;s trusted destination for premium laptop components and PC hardware.
              Genuine products, expert support, and fast delivery across Gujarat.
            </p>
          </div>

          {/* Right: Newsletter */}
          <div>
            <h3 className="text-base font-semibold">Newsletter</h3>
            <form className="mt-3 flex max-w-sm items-center gap-2">
              <input
                type="email"
                placeholder="Enter email address"
                className="border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-primary/30 flex-1 rounded-lg border px-3.5 py-2.5 text-sm transition outline-none focus:ring-2"
              />
              <button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors"
              >
                Submit
              </button>
            </form>
            <p className="text-muted-foreground mt-3 max-w-sm text-xs leading-relaxed">
              Stay connected with new collections, exclusive offers, and updates from our store.
            </p>
          </div>
        </div>

        {/* ── ROW 2: 4-column link grid ── */}
        <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold">{title}</h3>
              <ul className="mt-4 space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
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

          {/* Connect With Us */}
          <div>
            <h3 className="text-sm font-semibold">Connect With Us</h3>
            <div className="text-muted-foreground mt-4 space-y-2 text-sm">
              <p>
                <a
                  href={`mailto:${STORE.email}`}
                  className="hover:text-foreground break-all transition-colors"
                >
                  {STORE.email}
                </a>
              </p>
              <p>
                <a href={`tel:${STORE.phone}`} className="hover:text-foreground transition-colors">
                  {STORE.phone}
                </a>
              </p>
            </div>
            <div className="mt-4 flex items-center gap-2">
              {SOCIAL.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── ROW 3: Copyright (centered) + theme toggle ── */}
        <div className="border-border mt-10 flex flex-col items-center gap-3 border-t pt-8 sm:flex-row sm:justify-between">
          <p className="text-muted-foreground text-center text-xs sm:text-left">
            © {new Date().getFullYear()} {STORE.name}. All Rights Reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium">Theme:</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* ── Full-bleed bottom illustration ── */}
      <div className="w-full">
        <Image
          src="/footer-bottom.jpeg"
          alt="Indian landmarks illustration"
          width={1440}
          height={260}
          className="w-full object-cover object-top"
          priority
          unoptimized
        />
      </div>
    </footer>
  );
}
