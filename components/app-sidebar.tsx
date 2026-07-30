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

import { GalleryVerticalEndIcon, User2Icon, LayoutDashboardIcon, FolderArchiveIcon, Settings2Icon } from "lucide-react"
import { Session } from "next-auth"
import { UserRole } from "@prisma/client"
import type { AuthUser } from "@/lib/rbac"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  session: Session | null
  user: AuthUser   // sumber utama untuk role, name, email — selalu fresh dari DB
}
type NavItem = {
  title: string
  url: string
  icon: React.ReactNode
  roles?: UserRole[]
  items?: { title: string; url: string }[]
}

const navMain: NavItem[] = [
  {
    title: "Dashboard",
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
    roles: [UserRole.DIREKTUR],
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
]

const staticData = {
  teams: [
    {
      name: "SIAD Sekolah",
      logo: <GalleryVerticalEndIcon />,
      plan: "Ares Edition",
    }
  ],
  navMain,   // sudah bertipe NavItem[], tidak akan ke-infer literal lagi
  projects: [],
}

export function AppSidebar({
  session,
  user,
  ...props
}: AppSidebarProps) {
  const navItems = staticData.navMain.filter((item) => {
    if (!item.roles) return true
    return item.roles.includes(user.role)   // pakai user.role, bukan session?.user.role
  })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={staticData.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navItems} />
        <NavProjects projects={staticData.projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={{ name: user.name, email: user.email, avatar: "" }} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}