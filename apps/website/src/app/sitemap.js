import { fetchAllProductSlugs, fetchStoreCategories, fetchStoreBrands } from "@/lib/store";
import { fetchAllBlogSlugs, fetchBlogCategories } from "@/lib/blog";

const BASE_URL = process.env.FRONTEND_URL;

export default async function sitemap() {
  /* ------------------------------------------------------------------ */
  /* 1. Static pages                                                      */
  /* ------------------------------------------------------------------ */
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

  /* ------------------------------------------------------------------ */
  /* 2. Fetch all data in parallel                                        */
  /* ------------------------------------------------------------------ */
  const [brands, categories, products, blogSlugs, blogCategories] = await Promise.all([
    fetchStoreBrands(),
    fetchStoreCategories(),
    fetchAllProductSlugs(),
    fetchAllBlogSlugs(),
    fetchBlogCategories(),
  ]);

  /* ------------------------------------------------------------------ */
  /* 3. Brand pages  →  /brand-slug                                       */
  /* ------------------------------------------------------------------ */
  const brandPages = brands
    .filter((b) => b?.slug)
    .map((brand) => ({
      url: `${BASE_URL}/${brand.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

  /* ------------------------------------------------------------------ */
  /* 4. Category pages  →  /category-slug                                */
  /* ------------------------------------------------------------------ */
  // const categoryPages = categories
  //   .filter((c) => c?.slug)
  //   .map((cat) => ({
  //     url: `${BASE_URL}/${cat.slug}`,
  //     lastModified: new Date(),
  //     changeFrequency: "daily",
  //     priority: 0.85,
  //   }));

  /* ------------------------------------------------------------------ */
  /* 5. Brand + category pages  →  /brand-slug/category-slug             */
  /*    Derived from products: collect unique brand+category combos       */
  /* ------------------------------------------------------------------ */
  const brandCategorySet = new Set();
  for (const product of products) {
    const brandSlug = product.brands?.slug;
    const categorySlug = product.categories?.slug;
    if (brandSlug && categorySlug) {
      brandCategorySet.add(`${brandSlug}/${categorySlug}`);
    }
  }

  const brandCategoryPages = [...brandCategorySet].map((combo) => ({
    url: `${BASE_URL}/${combo}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.87,
  }));

  /* ------------------------------------------------------------------ */
  /* 6. Product pages  →  /brand-slug/category-slug/product-slug         */
  /* ------------------------------------------------------------------ */
  const productPages = products
    .filter((p) => p?.slug)
    .map((product) => {
      const brandSlug = product.brands?.slug;
      const categorySlug = product.categories?.slug;

      let path;
      if (brandSlug && categorySlug) {
        path = `/${brandSlug}/${categorySlug}/${product.slug}`;
      } else if (categorySlug) {
        path = `/${categorySlug}/${product.slug}`;
      } else {
        path = `/${product.slug}`;
      }

      return {
        url: `${BASE_URL}${path}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      };
    });

  /* ------------------------------------------------------------------ */
  /* 7. Combine — ordered by priority descending                          */
  /* ------------------------------------------------------------------ */
  /* ------------------------------------------------------------------ */
  /* 8. Blog listing + category pages  →  /blogs, /blogs/category-slug  */
  /* ------------------------------------------------------------------ */
  const blogListingPage = {
    url: `${BASE_URL}/blogs`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  };

  const blogCategoryPages = blogCategories
    .filter((c) => c?.slug)
    .map((cat) => ({
      url: `${BASE_URL}/blogs/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.75,
    }));

  /* ------------------------------------------------------------------ */
  /* 9. Blog post pages  →  /blogs/post-slug                             */
  /* ------------------------------------------------------------------ */
  const blogPostPages = blogSlugs
    .filter((b) => b?.slug)
    .map((post) => ({
      url: `${BASE_URL}/blogs/${post.slug}`,
      lastModified: post.published_at ? new Date(post.published_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.85,
    }));

  /* ------------------------------------------------------------------ */
  /* 10. Combine — ordered by priority descending                        */
  /* ------------------------------------------------------------------ */
  return [
    ...staticPages,
    ...brandPages,
    ...brandCategoryPages,
    ...productPages,
    blogListingPage,
    ...blogCategoryPages,
    ...blogPostPages,
  ];
}
