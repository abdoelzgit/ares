// lib/rbac.ts
import { cache } from 'react'
import { unstable_cache } from 'next/cache'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { UserRole, ConfidentialityLevel } from '@prisma/client'

const SUPER_ROLES: UserRole[] = ['DIREKTUR']

// Role yang akses HANYA per-user, tidak ada default dari RoleCategoryAccess sama sekali
const PER_USER_ONLY_ROLES: UserRole[] = ['GURU', 'PEMBINA']

// Role yang akses GABUNGAN: default dari RoleCategoryAccess + tambahan personal via UserCategoryAccess
const HYBRID_ROLES: UserRole[] = ['WAKASEK', 'TU', 'KEUANGAN']

// Sisanya (TU, KEUANGAN, PEMBINA) otomatis murni role-based lewat RoleCategoryAccess

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  categoryIds: string[]
}

export const getCurrentUser = cache(async (): Promise<AuthUser> => {
  const session = await auth()

  if (!session?.user?.email) {
    throw new Error('UNAUTHORIZED')
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      categoryAccess: { select: { categoryId: true } },
    },
  })

  if (!user) {
    throw new Error('UNAUTHORIZED')
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    categoryIds: user.categoryAccess.map((c) => c.categoryId),
  }
})

// Cache mapping role -> daftar categoryId default (dari RoleCategoryAccess)
export const getAllowedCategoryIds = unstable_cache(
  async (role: UserRole): Promise<string[]> => {
    const rows = await prisma.roleCategoryAccess.findMany({
      where: { role },
      select: { categoryId: true },
    })
    return rows.map((r) => r.categoryId)
  },
  ['role-category-access'],
  { revalidate: 60, tags: ['role-category-access'] }
)

export async function canAccessCategory(user: AuthUser, categoryId: string): Promise<boolean> {
  if (SUPER_ROLES.includes(user.role)) return true

  if (PER_USER_ONLY_ROLES.includes(user.role)) {
    return user.categoryIds.includes(categoryId)
  }

  if (HYBRID_ROLES.includes(user.role)) {
    // Akses personal dicek dulu (lebih murah, tidak perlu query cache)
    if (user.categoryIds.includes(categoryId)) return true

    const roleDefaults = await getAllowedCategoryIds(user.role)
    return roleDefaults.includes(categoryId)
  }

  // Role murni role-based (TU, KEUANGAN, PEMBINA, dst)
  const allowedIds = await getAllowedCategoryIds(user.role)
  return allowedIds.includes(categoryId)
}

export async function canAccessDocument(
  user: AuthUser,
  document: { categoryId: string; confidentialityLevel: ConfidentialityLevel }
): Promise<boolean> {
  const hasCategoryAccess = await canAccessCategory(user, document.categoryId)
  if (!hasCategoryAccess) return false

  if (document.confidentialityLevel === 'CONFIDENTIAL') {
    const allowedForConfidential: UserRole[] = ['DIREKTUR', 'WAKASEK']
    return allowedForConfidential.includes(user.role)
  }

  return true
}

export async function assertCategoryAccess(user: AuthUser, categoryId: string) {
  const allowed = await canAccessCategory(user, categoryId)
  if (!allowed) throw new Error('FORBIDDEN')
}

export async function assertDocumentAccess(
  user: AuthUser,
  document: { categoryId: string; confidentialityLevel: ConfidentialityLevel }
) {
  const allowed = await canAccessDocument(user, document)
  if (!allowed) throw new Error('FORBIDDEN')
}

export async function getAccessibleCategoryIds(user: AuthUser): Promise<string[] | undefined> {
  if (SUPER_ROLES.includes(user.role)) return undefined

  if (PER_USER_ONLY_ROLES.includes(user.role)) {
    return user.categoryIds
  }

  if (HYBRID_ROLES.includes(user.role)) {
    const roleDefaults = await getAllowedCategoryIds(user.role)
    const combined = new Set([...roleDefaults, ...user.categoryIds])
    return Array.from(combined)
  }

  const ids = await getAllowedCategoryIds(user.role)
  return ids
}

export async function getAccessibleDocuments(user: AuthUser) {
  const categoryIds = await getAccessibleCategoryIds(user)

  return prisma.document.findMany({
    where: categoryIds ? { categoryId: { in: categoryIds } } : {},
    include: { category: true, currentVersion: true },
    orderBy: { updatedAt: 'desc' },
  })
}

// Helper: resolve categoryId dari code (dipakai di layout/action yang terima param URL berupa code)
export async function resolveCategoryIdFromCode(categoryCode: string): Promise<string> {
  const category = await prisma.category.findUnique({
    where: { code: categoryCode },
    select: { id: true },
  })
  if (!category) throw new Error('NOT_FOUND')
  return category.id
}