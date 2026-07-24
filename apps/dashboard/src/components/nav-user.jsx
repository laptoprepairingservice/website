"use client";

import { Bell, ChevronsUpDown, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAppContext } from "@/app/_context";
import { Avatar } from "ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "ui/components/dropdown-menu";
import { Label } from "ui/components/label";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "ui/components/sidebar";
import { Switch } from "ui/components/switch";
import { ThemeSwitcherMenu } from "./theme-switcher-menu";
import { AvatarImage } from "./user/avatar";
import { signOut } from "next-auth/react";

export function NavUser({ user }) {
  const { isMobile } = useSidebar();
  const { entitlements, setEntitlements } = useAppContext();

  const router = useRouter();
  function handleLogout() {
    signOut();
    router.push("/login");
  }

  const toggleSensitiveOps = () => {
    setEntitlements((prev) => ({
      ...prev,
      isSensitiveVisible: !prev.isSensitiveVisible,
    }));
  };

  const userType = user?.user_type?.charAt(0).toUpperCase() + user?.user_type?.slice(1);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage name={user?.name} image={user?.avatar} />
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user?.name}</span>
                <span className="truncate text-xs">{userType}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage name={user?.name} image={user?.avatar} />
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.name}</span>
                  <span className="truncate text-xs">{user?.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            {user?.isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={(e) => e.preventDefault()}>
                    <div className="flex w-full items-center justify-between">
                      <Label>Secure Field</Label>
                      <Switch
                        checked={entitlements.isSensitiveVisible}
                        onCheckedChange={toggleSensitiveOps}
                      />
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings">
                      <Settings />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            )}
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <ThemeSwitcherMenu />
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
