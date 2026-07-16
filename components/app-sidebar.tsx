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
import { GalleryVerticalEndIcon, LayoutDashboardIcon, FolderArchiveIcon, Settings2Icon } from "lucide-react"

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
      icon: (
        <LayoutDashboardIcon />
      ),
    },
    {
      title: "Arsip",
      url: "/dashboard/archive",
      icon: (
        <FolderArchiveIcon />
      ),
    },
    {
      title: "Evaluasi Semester",
      url: "#",
      icon: (
        <Settings2Icon />
      ),
      items: [
        {
          title: "Validasi Berkas",
          url: "#",
        },
        {
          title: "Laporan Duplikasi",
          url: "#",
        }
      ],
    },
  ],
  projects: [],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
