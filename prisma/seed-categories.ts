// prisma/seed-categories.ts
//
// Seed kategori/bidang default untuk sistem arsip dokumen sekolah.
// Jalankan file ini SEBELUM seed-rbac.ts dan seed-users.ts,
// karena keduanya bergantung pada kategori yang sudah ada.

import { prisma } from '../lib/prisma'

const CATEGORIES = [
  { code: 'FIN', name: 'Keuangan' },
  { code: 'OPS', name: 'Operasional' },
  { code: 'BRD', name: 'Boarding' },
  { code: 'COM', name: 'Humas' },
  { code: 'HRD', name: 'SDM' },
  { code: 'CUR', name: 'Kurikulum' },
  { code: 'STU', name: 'Kesiswaan' },
  { code: 'QMS', name: 'Penjamin Mutu' },
  { code: 'IT', name: 'Teknologi Informasi' },
  { code: 'GOV', name: 'Tata Kelola' },
]

async function main() {
  console.log('🌱 Mulai seeding categories...\n')

  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { code: cat.code },
      update: { name: cat.name },
      create: { code: cat.code, name: cat.name },
    })

    console.log(`✅ ${category.code} — ${category.name}`)
  }

  console.log('\n🌱 Selesai seeding categories.')
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
