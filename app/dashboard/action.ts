// app/dashboard/action.ts
'use server'

import db from '@/lib/prisma'
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
  return getAccessibleDocuments(user) // sudah handle RBAC filtering di dalamnya
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

export async function bulkUploadDocumentsAction(items: {
  title: string
  documentNumber: string
  categoryId: string
  schoolYearId: string
  description: string
  confidentialityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL'
  filePath: string
}[]) {
  const user = await getCurrentUser()
  const results = []

  for (const item of items) {
    try {
      await assertCategoryAccess(user, item.categoryId)
      
      const doc = await db.$transaction(async (tx) => {
        const newDoc = await tx.document.create({
          data: {
            title: item.title,
            documentNumber: item.documentNumber,
            categoryId: item.categoryId,
            schoolYearId: item.schoolYearId,
            description: item.description,
            confidentialityLevel: item.confidentialityLevel,
          },
        })

        const version = await tx.documentVersion.create({
          data: {
            documentId: newDoc.id,
            versionNumber: '1',
            filePath: item.filePath,
            uploadedById: user.id,
          },
        })

        await tx.document.update({
          where: { id: newDoc.id },
          data: { currentVersionId: version.id },
        })

        return newDoc
      })
      results.push({ success: true, id: doc.id, title: item.title })
    } catch (e: any) {
      results.push({ success: false, title: item.title, error: e.message || 'FAILED' })
    }
  }
  return results
}
