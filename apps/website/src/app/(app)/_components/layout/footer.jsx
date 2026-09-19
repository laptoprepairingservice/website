import Link from "next/link";
import Image from "next/image";
import { Icon } from "@iconify/react";

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
  { icon: "mdi:instagram", href: "#", label: "Instagram" },
  { icon: "mdi:facebook", href: "#", label: "Facebook" },
  { icon: "mdi:whatsapp", href: "#", label: "WhatsApp" },
  { icon: "mdi:youtube", href: "#", label: "YouTube" },
  { icon: "mdi:pinterest", href: "#", label: "Pinterest" },
  { icon: "mdi:linkedin", href: "#", label: "LinkedIn" },
  { icon: "mdi:dribbble", href: "#", label: "Dribbble" },
  { icon: "mdi:behance", href: "#", label: "Behance" },
];

export function Footer() {
  return (
    <footer className="bg-muted/30 border-border relative overflow-hidden border-t">
      <div className="container">
        {/* Main footer */}
        <div className="border-border border-b py-8 sm:py-10 lg:py-14">
          <div className="grid gap-8 sm:gap-10 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5">
                <div className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold">
                  RJ
                </div>
                <span className="text-lg font-bold tracking-tight sm:text-2xl">{STORE.name}</span>
              </Link>

              <p className="text-muted-foreground mt-3 max-w-sm text-sm leading-relaxed sm:mt-4">
                Ahmedabad&apos;s trusted destination for premium laptop components and PC hardware.
                Genuine products, expert support, and fast delivery across Gujarat.
              </p>

              <div className="text-muted-foreground mt-4 space-y-2 text-sm">
                <a
                  href={`mailto:${STORE.email}`}
                  className="hover:text-foreground block break-all transition-colors"
                >
                  {STORE.email}
                </a>

                <a
                  href={`tel:${STORE.phone}`}
                  className="hover:text-foreground block transition-colors"
                >
                  {STORE.phone}
                </a>
              </div>
            </div>

            {/* Footer navigation */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 md:col-span-2 lg:col-span-3 lg:gap-8">
              {Object.entries(FOOTER_LINKS).map(([title, links]) => (
                <div key={title}>
                  <h3 className="text-sm font-semibold">{title}</h3>

                  <ul className="mt-3 space-y-2 sm:mt-4 sm:space-y-2.5">
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
          </div>
        </div>

        {/* Bottom footer */}
        <div className="flex flex-col gap-5 py-5 sm:gap-4 md:flex-row md:items-center md:justify-between">
          {/* Copyright */}
          <p className="text-muted-foreground order-3 text-center text-xs md:order-1 md:text-left">
            © {new Date().getFullYear()} {STORE.name}. All Rights Reserved.
          </p>

          {/* Social links */}
          <div className="order-1 flex justify-center md:order-2">
            <div className="flex max-w-full flex-wrap justify-center gap-2">
              {SOCIAL.map(({ icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary flex size-8 shrink-0 items-center justify-center rounded-full border transition-colors sm:size-9"
                >
                  <Icon icon={icon} className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div className="order-2 flex items-center justify-center gap-2 md:order-3">
            <span className="text-muted-foreground text-xs font-medium">Theme:</span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Footer image */}
      <div className="w-full">
        <Image
          src="/footer-image.png"
          alt=""
          width={1440}
          height={260}
          sizes="100vw"
          className="h-auto w-full object-cover object-center"
          priority
          unoptimized
        />
      </div>
    </footer>
  );
}
