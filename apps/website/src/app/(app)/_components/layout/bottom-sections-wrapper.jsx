"use client";

import { usePathname } from "next/navigation";

/**
 * BottomSectionsWrapper - Dynamically controls visibility of global bottom sections.
 * Automatically excludes checkout and cart flows to prevent distraction during purchasing.
 */
export function BottomSectionsWrapper({ bestSellerSection, latestBlogsSection }) {
  const pathname = usePathname();

  // Exclude transactional pages (cart, checkout, account dashboard)
  const isExcluded =
    pathname?.startsWith("/checkout") ||
    pathname === "/cart" ||
    pathname?.startsWith("/account");

  if (isExcluded) {
    return null;
  }

  // On the main /blogs listing page, avoid redundant "Latest Blogs" section
  const isBlogsIndex = pathname === "/blogs";

  return (
    <div className="w-full">
      {bestSellerSection}
      {!isBlogsIndex && latestBlogsSection}
    </div>
  );
}
