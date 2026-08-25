import { DashboardHeader } from "./_components/dashboard-header";

export default function AppLayout({ children }) {
  return (
    <div className="bg-background min-h-svh">
      <DashboardHeader />
      <main className="p-6">{children}</main>
    </div>
  );
}
