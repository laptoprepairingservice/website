import { AppSidebar } from "@/components/app-sidebar";
import { Breadcrumb, BreadcrumbProvider } from "@/components/breadcrumb";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@ui/shadcn/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@ui/shadcn/components/sidebar";

export default function AppLayout({ children }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <BreadcrumbProvider>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 hidden h-4 sm:block" />
            <Breadcrumb />
            <div className="ml-auto">
              <ModeToggle />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">{children}</div>
        </BreadcrumbProvider>
      </SidebarInset>
    </SidebarProvider>
  );
}
