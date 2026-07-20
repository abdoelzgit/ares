// app/dashboard/archive/[year]/[category]/layout.tsx
import { getCurrentUser, canAccessCategory, resolveCategoryIdFromCode } from '@/lib/rbac'
import { redirect } from 'next/navigation'

export default async function CategoryLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ category: string }>
}) {
  const { category: categoryCode } = await params
  const user = await getCurrentUser()

  const categoryId = await resolveCategoryIdFromCode(categoryCode)
  const allowed = await canAccessCategory(user, categoryId)
  if (!allowed) {
    redirect('/dashboard/unauthorized')
  }

  return <>{children}</>
}