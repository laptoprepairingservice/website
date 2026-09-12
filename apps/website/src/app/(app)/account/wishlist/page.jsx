import { WishlistClient } from "@/app/(app)/wishlist/wishlist-client";

export const metadata = {
  title: "Wishlist | My Account",
  description: "Manage your saved products.",
};

export const dynamic = "force-dynamic";

export default function AccountWishlistPage() {
  return <WishlistClient isAccountView />;
}
