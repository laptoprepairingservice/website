import { fetchAllProductSlugs, fetchStoreCategories } from "@/lib/store";
import { getProductUrl } from "@/lib/url";

const BASE_URL = "https://Ranuja.in";

export default async function sitemap() {
  const staticPages = [
    "",
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

  const categories = await fetchStoreCategories();
  const categoryPages = categories.map((cat) => ({
    url: `${BASE_URL}/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.85,
  }));

  const products = await fetchAllProductSlugs();
  const productPages = products.map((product) => ({
    url: `${BASE_URL}${getProductUrl(product)}`,
    lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticPages, ...categoryPages, ...productPages];
}

