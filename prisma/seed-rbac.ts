// prisma/seed-rbac.ts
//
// Seed default akses kategori berdasarkan role, sesuai Hak Akses:
// - DIREKTUR   -> semua dokumen (ditangani via SUPER_ROLES di lib/rbac.ts, tidak perlu row di sini)
// - WAKASEK    -> hybrid: default role (opsional, isi ROLE_ACCESS_MAP kalau perlu) + akses personal via UserCategoryAccess
// - GURU       -> murni per-user via UserCategoryAccess, TIDAK di-seed di sini
// - TU         -> Administrasi (OPS)
// - KEUANGAN   -> Keuangan (FIN)
// - PEMBINA    -> Boarding (BRD)
//
// Kode kategori yang tersedia di database (referensi):
// FIN (Keuangan), OPS (Operasional), BRD (Boarding), COM (Humas),
// HRD (SDM), CUR (Kurikulum), STU (Kesiswaan), QMS (Penjamin Mutu),
// IT (Teknologi Informasi), GOV (Tata Kelola)

import { prisma } from '../lib/prisma'

const ROLE_ACCESS_MAP: Record<string, string[]> = {
  KEUANGAN: ['FIN'],
  PEMBINA: ['BRD'],
  TU: ['OPS'],

  // WAKASEK: isi di sini HANYA kalau semua WAKASEK butuh baseline default
  // yang sama, di luar akses personal per-user mereka masing-masing.
  // Kosongkan (atau hapus baris ini) kalau WAKASEK murni per-user.
  // WAKASEK: ['GOV'],

  // GURU sengaja TIDAK dimasukkan — akses GURU murni per-user
  // lewat UserCategoryAccess, bukan RoleCategoryAccess.
}

async function main() {
  console.log('🌱 Mulai seeding role_category_access...\n')

  for (const [role, codes] of Object.entries(ROLE_ACCESS_MAP)) {
    for (const code of codes) {
      const category = await prisma.category.findUnique({ where: { code } })

      if (!category) {
        console.warn(`⚠️  Kategori dengan code "${code}" tidak ditemukan, dilewati.`)
        continue
      }

      await prisma.roleCategoryAccess.upsert({
        where: {
          role_categoryId: {
            role: role as any,
            categoryId: category.id,
          },
        },
        update: {},
        create: {
          role: role as any,
          categoryId: category.id,
        },
      })

      console.log(`✅ ${role} → ${category.code} (${category.name})`)
    }
  }

  console.log('\n🌱 Selesai seeding role_category_access.')
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
