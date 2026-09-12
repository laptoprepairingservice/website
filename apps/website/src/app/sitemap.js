import { fetchAllProductSlugs } from "@/lib/supabase/store-data";

const BASE_URL = "https://Ranuja.in";

export default async function sitemap() {
  const staticPages = [
    "",
    "/products",
    "/about",
    "/contact",
    "/privacy",
    "/returns",
    "/terms",
    "/cart",
    "/wishlist",
    "/search",
    "/login",
    "/register",
  ].map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));

  const products = await fetchAllProductSlugs();
  const productPages = products.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticPages, ...productPages];
}
