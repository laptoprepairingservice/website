import { WishlistClient } from "./wishlist-client";

export const metadata = {
  title: "Wishlist",
  description: "Your saved computer hardware products.",
};

export const dynamic = "force-dynamic";

export default function WishlistPage() {
  return (
    <div className="py-8 lg:py-12">
      <WishlistClient />
    </div>
  );
}
