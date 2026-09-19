import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";
import { STORE } from "@/lib/store-config";
import { ThemeToggle } from "../theme-toggle";
import { Icon } from "@iconify/react";

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
  { icon: "mdi:instagram", href: "#", label: "Instagram" },
  { icon: "mdi:facebook", href: "#", label: "Facebook" },
  { icon: "mdi:whatsapp", href: "#", label: "Whatsapp" },
  { icon: "mdi:youtube", href: "#", label: "Youtube" },
  { icon: "mdi:pinterest", href: "#", label: "Pinterest" },
  { icon: "mdi:linkedin", href: "#", label: "Linkedin" },
  { icon: "mdi:dribbble", href: "#", label: "Dribbble" },
  { icon: "mdi:behance", href: "#", label: "Behance" },
];

export function Footer() {
  return (
    <footer className="border-border bg-muted/30 relative overflow-hidden border-t">
      <div className="container pt-10 lg:pt-14">
        {/* ── ROW 1: Brand (left) | Newsletter (right) ── */}
        <div className="border-border grid gap-10 border-b pb-10 md:grid-cols-4">
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
          </div>
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
        </div>

        {/* ── ROW 3: Copyright (centered) + theme toggle ── */}
        <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between md:mt-0">
          <p className="text-muted-foreground text-center text-xs sm:text-left">
            © {new Date().getFullYear()} {STORE.name}. All Rights Reserved.
          </p>
          <div>
            <div className="mt-4 flex items-center gap-2">
              {SOCIAL.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary flex size-9 items-center justify-center rounded-full border transition-colors"
                >
                  <Icon icon={icon} className="size-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-xs font-medium">Theme:</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <Icon />

      <div className="w-full">
        <Image
          src="/footer-image.png"
          alt="footer img"
          width={1440}
          height={260}
          className="w-full object-cover"
          priority
          unoptimized
        />
      </div>
    </footer>
  );
}
