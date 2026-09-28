import { getCurrentUser } from "@/lib/user";
import { AccountSidebar } from "./_components/account-sidebar";
import { AccountMobileNav } from "./_components/account-mobile-nav";

export default async function AccountLayout({ children }) {
  const user = await getCurrentUser();

  const firstName =
    user?.first_name || user?.name || user?.email?.split("@")[0] || "User";
  const lastName = user?.last_name || "";
  const email = user?.email || "";

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-6 lg:py-8">
        <div className="flex gap-8">
          {/* Sticky Sidebar — hidden on mobile */}
          <aside className="hidden w-64 shrink-0 lg:block">
            <div className="sticky top-24">
              <AccountSidebar
                firstName={firstName}
                lastName={lastName}
                email={email}
              />
            </div>
          </aside>

          {/* Main content */}
          <main className="min-w-0 flex-1 pb-24 lg:pb-8">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      <AccountMobileNav />
    </div>
  );
}
