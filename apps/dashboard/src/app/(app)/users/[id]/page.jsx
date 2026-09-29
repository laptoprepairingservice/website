import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@ui/shadcn/components/button";
import { fetchUserData } from "./_lib/queries";
import { UserProfileCard } from "./_components/user-profile-card";
import { UserOrdersList } from "./_components/user-orders-list";
import { UserAddressesList } from "./_components/user-addresses-list";
import { UserActivityFeed } from "./_components/user-activity-feed";

export const dynamic = "force-dynamic";

export default async function UserDetailPage({ params }) {
  const { id } = await params;
  const { profile, profileError, orders, addresses } = await fetchUserData(id);

  if (profileError || !profile) notFound();

  return (
    <div className="space-y-6">
      {/* Back */}
      <Button asChild variant="ghost" size="sm" className="text-muted-foreground -ml-2 gap-1.5">
        <Link href="/users">
          <ArrowLeft className="size-4" />
          All Users
        </Link>
      </Button>

      {/* Profile card with stats */}
      <UserProfileCard profile={profile} orders={orders} />

      {/* Orders (left) + Addresses & Activity (right) */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <UserOrdersList orders={orders} userId={id} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <UserAddressesList addresses={addresses} />
          <UserActivityFeed orders={orders} />
        </div>
      </div>
    </div>
  );
}
