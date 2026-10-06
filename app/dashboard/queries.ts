import 'server-only'

import db from '@/lib/prisma'
import { getCurrentUser, getAccessibleCategoryIds } from '@/lib/rbac'

export async function getDashboardStats() {
  const user = await getCurrentUser()
  const accessibleIds = await getAccessibleCategoryIds(user)

  const categoryFilter = accessibleIds ? { categoryId: { in: accessibleIds } } : {}

  const latestArchiveYear = await db.archiveYear.findFirst({
    orderBy: { year: 'desc' },
  })

  const [totalDocs, activeYearDocsCount, totalCategories] = await Promise.all([
    db.document.count({ where: categoryFilter }),
    latestArchiveYear
      ? db.document.count({
          where: { ...categoryFilter, schoolYearId: latestArchiveYear.id },
        })
      : Promise.resolve(0),
    db.category.count(),
  ])

  return {
    totalDocs,
    activeYearDocsCount,
    activeYearLabel: latestArchiveYear?.year ?? '-',
    accessibleCategoriesCount: accessibleIds ? accessibleIds.length : totalCategories,
    totalCategories,
  }
}
