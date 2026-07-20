// lib/seed-role.ts
import { prisma } from '@/lib/prisma'   // pakai instance yang sudah dikonfigurasi dengan adapter

async function main() {
  const roleAccessMap: Record<string, string[]> = {
    KEUANGAN: ['FIN'],
    PEMBINA: ['BRD'],
    TU: ['OPS'],
  }

  for (const [role, codes] of Object.entries(roleAccessMap)) {
    for (const code of codes) {
      const category = await prisma.category.findUnique({ where: { code } })
      if (!category) {
        console.warn(`⚠️  Kategori dengan code "${code}" tidak ditemukan, dilewati.`)
        continue
      }

      await prisma.roleCategoryAccess.upsert({
        where: { role_categoryId: { role: role as any, categoryId: category.id } },
        update: {},
        create: { role: role as any, categoryId: category.id },
      })
      console.log(`✅ ${role} → ${category.code} (${category.name})`)
    }
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())