// app/dashboard/layout.tsx
import { auth } from '@/auth'
import { getCurrentUser } from '@/lib/rbac'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [session, user] = await Promise.all([auth(), getCurrentUser()])

  return (
    <SidebarProvider>
      <AppSidebar session={session} user={user} />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  )
}