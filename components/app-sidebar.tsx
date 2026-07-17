"use client"

import * as React from "react"

import { NavMain } from "@/components/nav-main"
import { NavProjects } from "@/components/nav-projects"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { GalleryVerticalEndIcon,User2Icon, LayoutDashboardIcon, FolderArchiveIcon, Settings2Icon, User } from "lucide-react"
import { Session } from "next-auth";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: Session | null;
}
import { UserRole } from "@prisma/client"

// This is sample data.
const data = {
  user: {
    name: "Staf Admin",
    email: "admin@school.sch.id",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "SIAD Sekolah",
      logo: (
        <GalleryVerticalEndIcon />
      ),
      plan: "Ares Edition",
    }
  ],
  navMain: [
    {
      title: "Dashboard Utama",
      url: "/dashboard",
      icon: <LayoutDashboardIcon />,
    },
    {
      title: "Arsip",
      url: "/dashboard/archive",
      icon: <FolderArchiveIcon />,
    },
    {
      title: "User",
      url: "/dashboard/users",
      icon: <User2Icon />,
      roles: [UserRole.DIREKTUR], // <-- hanya direktur
    },
    {
      title: "Evaluasi Semester",
      url: "#",
      icon: <Settings2Icon />,
      items: [
        {
          title: "Validasi Berkas",
          url: "#",
        },
      ],
    },
  ],
  projects: [],
}

export function AppSidebar({
  session,
  ...props
}: AppSidebarProps) {
  const navItems = data.navMain.filter((item) => {
    if (!item.roles) return true;

    return item.roles.includes(session?.user.role);
  });

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
        <NavProjects projects={data.projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}