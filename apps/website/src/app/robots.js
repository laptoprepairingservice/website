import { STORE } from "@/lib/store-config";

export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/account/", "/admin/", "/api/"],
    },
    sitemap: "https://Ranuja.in/sitemap.xml",
    host: "https://Ranuja.in",
  };
}

export const metadata = {
  title: `Robots | ${STORE.name}`,
};
