"use client";

import {
  Book,
  Building,
  ClipboardList,
  GraduationCap,
  LifeBuoy,
  Medal,
  Send,
  SquareTerminal,
  UserIcon,
} from "lucide-react";
import { useMemo } from "react";

import { useAppContext } from "@/app/_context";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { TenantLogo } from "@/components/tenant/logo";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "ui/components/sidebar";
import packageJson from "../../package.json";

export function AppSidebar({ ...props }) {
  const { user, tenant } = useAppContext();

  const data = useMemo(
    () => ({
      user: user,
      navMain: [
        {
          title: "Student Management",
          url: "/dashboard/students",
          icon: UserIcon,
          isActive: true,
          items: [
            {
              title: "Students",
              url: "/dashboard/students",
            },
            {
              title: "Admissions",
              url: "/dashboard/students/add",
            },
            {
              title: "Student Promotion",
              url: "/dashboard/students/promote",
            },
            {
              title: "Birthdays & Celebrations",
              url: "/dashboard/students/celebrations",
            },
          ],
        },
        {
          title: "Academic Management",
          url: "/dashboard/institutions",
          icon: GraduationCap,
          isActive: true,
          items: [
            {
              title: "Institutions",
              url: "/dashboard/institutions",
            },
            {
              title: "Subjects",
              url: "/dashboard/subjects",
            },
            {
              title: "Attendance",
              url: "/dashboard/attendance/history",
            },
            {
              title: "Live Attendance",
              url: "/live",
            },
            {
              title: "Homework",
              url: "/dashboard/homework",
            },
            {
              title: "Student Promotion",
              url: "/dashboard/promotion",
            },
          ],
        },
        {
          title: "Exam Management",
          url: "/dashboard/exams/schedules",
          icon: ClipboardList,
          isActive: true,
          items: [
            {
              title: "Exam Categories",
              url: "/dashboard/exams/categories",
            },
            {
              title: "Exams",
              url: "/dashboard/exams/schedules",
            },
          ],
        },
        {
          title: "Student Activities",
          url: "/dashboard/achievement-categories",
          icon: Medal,
          isActive: true,
          items: [
            {
              title: "Achievements",
              url: "/dashboard/achievement-categories",
            },
            {
              title: "Discipline",
              url: "/dashboard/discipline-categories",
            },
            {
              title: "Calendar",
              url: "/dashboard/calendar",
            },
          ],
        },
        {
          title: "Hostel Management",
          url: "/dashboard/hostel",
          icon: Building,
          isActive: true,
          items: [
            {
              title: "Hostels",
              url: "/dashboard/hostel",
            },
            {
              title: "Hostel Schedule",
              url: "/dashboard/hostel/schedule",
            },
            {
              title: "Hostel Attendance",
              url: "/dashboard/hostel/attendance",
            },
            {
              title: "Hostel Activity",
              url: "/dashboard/hostel/activity",
            },
          ],
        },
        {
          title: "Leave Management",
          url: "/dashboard/leave",
          icon: GraduationCap,
          isActive: true,
          items: [
            {
              title: "Leave Requests",
              url: "/dashboard/leave/requests",
            },
            {
              title: "Leave Categories",
              url: "/dashboard/leave/categories",
            },
            {
              title: "Leave Policies",
              url: "/dashboard/leave/policies",
            },
            {
              title: "Approvers",
              url: "/dashboard/leave/approvers",
            },
          ],
        },
        {
          title: "Administration",
          url: "/dashboard",
          icon: SquareTerminal,
          isActive: true,
          items: [
            {
              title: "Users",
              url: "/dashboard/users",
            },
            {
              title: "Roles",
              url: "/dashboard/role-permissions",
            },
            {
              title: "Settings",
              url: "/dashboard/settings",
            },
          ],
        },
      ],
      navSecondary: [
        {
          title: "Support",
          url: "#",
          icon: LifeBuoy,
        },
        {
          title: "Feedback",
          url: "#",
          icon: Send,
        },
      ],
      projects: [
        {
          name: "Library",
          url: "#",
          icon: Book,
        },
      ],
    }),
    [user, tenant]
  );

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/">
                <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <TenantLogo tenant={tenant} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{tenant?.name}</span>
                  <span className="truncate text-xs">{tenant?.display_name || tenant?.name}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
        <div className="text-center font-mono text-xs"> Version {packageJson.version}</div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
