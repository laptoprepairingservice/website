import { PRODUCTS } from "@/lib/data/products";
import { STORE } from "@/lib/store-config";

const BASE_URL = "https://Ranuja.in";

export default function sitemap() {
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

  const productPages = PRODUCTS.map((product) => ({
    url: `${BASE_URL}/products/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticPages, ...productPages];
}
