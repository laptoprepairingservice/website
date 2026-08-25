import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { auth } from "@/lib/auth";

export default async function AppLayout({ children }) {
  const session = await auth();

  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader user={session?.user} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  );
}
