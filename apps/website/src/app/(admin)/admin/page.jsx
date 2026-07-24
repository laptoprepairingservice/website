import { FileText, Image, Package, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Admin Dashboard",
};

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your Ranuja store</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Package, label: "Products", value: "12" },
          { icon: FileText, label: "Static Pages", value: "5" },
          { icon: Image, label: "Media Files", value: "48" },
          { icon: Settings, label: "Settings", value: "Active" },
        ].map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className="bg-primary/5 flex size-12 items-center justify-center rounded-xl">
                <Icon className="text-primary size-6" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{value}</p>
                <p className="text-muted-foreground text-sm">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "Edit About Page",
            "Upload Media",
            "Update Store Info",
            "Configure Shipping",
            "Manage GST Settings",
          ].map((action) => (
            <div
              key={action}
              className="border-border bg-card hover:bg-accent/50 rounded-lg border p-4 text-sm font-medium"
            >
              {action}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
