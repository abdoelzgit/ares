// lib/access-control.ts
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'
import type { UserRole } from '@prisma/client'

export const getAllowedCategoryCodes = unstable_cache(
  async (role: UserRole): Promise<Set<string>> => {
    const rows = await prisma.roleCategoryAccess.findMany({
      where: { role },
      select: { category: { select: { code: true } } },
    })
    return new Set(rows.map((r) => r.category.code))
  },
  ['role-category-access'],
  { revalidate: 60, tags: ['role-category-access'] }
)

export async function canAccessCategory(role: UserRole, categoryCode: string): Promise<boolean> {
  const allowed = await getAllowedCategoryCodes(role)
  return allowed.has(categoryCode)
}