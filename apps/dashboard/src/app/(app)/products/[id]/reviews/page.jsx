import { notFound } from "next/navigation";
import {
  getProductReviewsForProductAction,
  getReviewCustomersAction,
} from "../../_actions/review-actions";
import { ProductReviewsView } from "./_components/product-reviews-view";

export const metadata = {
  title: "Product Reviews | Admin Dashboard",
  description: "Manage and assign verified customer reviews and ratings to products.",
};

export default async function ProductReviewsPage({ params }) {
  const { id: productIdentifier } = await params;

  const [reviewsResult, customers] = await Promise.all([
    getProductReviewsForProductAction(productIdentifier),
    getReviewCustomersAction(),
  ]);

  if (reviewsResult.error || !reviewsResult.product) {
    notFound();
  }

  return (
    <ProductReviewsView
      product={reviewsResult.product}
      reviews={reviewsResult.reviews || []}
      stats={reviewsResult.stats || { total: 0, average: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }}
      users={customers || []}
    />
  );
}
