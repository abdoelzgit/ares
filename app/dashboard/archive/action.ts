'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'

export async function getArchiveYears() {
  const years = await prisma.archiveYear.findMany({
    orderBy: { year: 'desc' },
    include: {
      _count: { select: { documents: true } },
    },
  })

  const categoryCount = await prisma.category.count()

  return years.map((y) => ({
    id: y.id,
    year: y.year,
    categoryCount,
    docCount: y._count.documents,
  }))
}

export async function createArchiveYear(year: string) {
  const user = await getCurrentUser()

  if (user.role !== 'DIREKTUR') {
    return { success: false, error: 'Hanya Direktur yang bisa menambah tahun ajaran.' }
  }

  const trimmedYear = year.trim()
  if (!/^\d{4}$/.test(trimmedYear)) {
    return { success: false, error: 'Format tahun tidak valid, gunakan 4 digit (contoh: 2027).' }
  }

  try {
    const existing = await prisma.archiveYear.findUnique({ where: { year: trimmedYear } })
    if (existing) {
      return { success: false, error: 'Tahun ajaran ini sudah ada.' }
    }

    await prisma.archiveYear.create({ data: { year: trimmedYear } })

    revalidatePath('/dashboard/archive')
    return { success: true }
  } catch (err: any) {
    console.error('Error creating archive year:', err)
    return { success: false, error: 'Gagal membuat tahun ajaran.' }
  }
}