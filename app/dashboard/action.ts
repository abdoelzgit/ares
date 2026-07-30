// app/dashboard/actions.ts
'use server'

import db  from '@/lib/prisma'
import { getCurrentUser, getAccessibleCategoryIds, assertCategoryAccess, getAccessibleDocuments } from '@/lib/rbac'

export async function getAccessibleCategoriesForUser() {
  const user = await getCurrentUser()
  const accessibleIds = await getAccessibleCategoryIds(user) // undefined = semua

  const categories = await db.category.findMany({
    orderBy: { name: 'asc' },
  })

  if (accessibleIds === undefined) return categories // DIREKTUR, semua kategori

  return categories.filter((c) => accessibleIds.includes(c.id))
}

export async function getAllAccessibleDocuments() {
  const user = await getCurrentUser()
  return getAccessibleDocuments(user)   // sudah handle RBAC filtering di dalamnya
}



export async function getDocumentsByCategory(categoryCode: string) {
  const user = await getCurrentUser()

  const category = await db.category.findUnique({ where: { code: categoryCode } })
  if (!category) throw new Error('NOT_FOUND')

  await assertCategoryAccess(user, category.id)

  return db.document.findMany({
    where: { categoryId: category.id },
    include: {
      currentVersion: true,
      category: { select: { code: true, name: true } },
      schoolYear: { select: { year: true } },
    },
    orderBy: { updatedAt: 'desc' },
  })
}
