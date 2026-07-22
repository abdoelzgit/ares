// prisma/seed-users.ts
//
// Seed user default — satu user per role, untuk keperluan testing/awal setup.
// Jalankan SETELAH seed-categories.ts (karena GURU/WAKASEK butuh categoryId valid).
//
// ⚠️ PENTING: Ganti semua password default di bawah ini setelah login pertama kali,
// terutama sebelum dipakai di lingkungan produksi sekolah sungguhan.

import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma'
import { UserRole } from '@prisma/client'

const DEFAULT_PASSWORD = '123' // ganti setelah seed & login pertama

type SeedUser = {
  name: string
  email: string
  role: UserRole
  categoryCodes?: string[] // hanya relevan untuk GURU / WAKASEK (akses personal)
}

const USERS: SeedUser[] = [
  {
    name: 'Direktur Sekolah',
    email: 'direktur@school.sch.id',
    role: 'DIREKTUR',
  },
  {
    name: 'Wakasek Kurikulum',
    email: 'wakasek.kurikulum@school.sch.id',
    role: 'WAKASEK',
    categoryCodes: ['CUR'],
  },
  {
    name: 'Guru Contoh',
    email: 'guru@school.sch.id',
    role: 'GURU',
    categoryCodes: ['CUR'],
  },
  {
    name: 'Pembina Asrama',
    email: 'pembina@school.sch.id',
    role: 'PEMBINA',
  },
  {
    name: 'Staf Tata Usaha',
    email: 'tu@school.sch.id',
    role: 'TU',
  },
  {
    name: 'Staf Keuangan',
    email: 'keuangan@school.sch.id',
    role: 'KEUANGAN',
  },
]

async function main() {
  console.log('🌱 Mulai seeding users...\n')

  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10)

  for (const u of USERS) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })

    if (existing) {
      console.log(`⏭️  ${u.email} sudah ada, dilewati.`)
      continue
    }

    // Resolve categoryCodes -> categoryId untuk relasi UserCategoryAccess
    let categoryIds: string[] = []
    if (u.categoryCodes?.length) {
      const categories = await prisma.category.findMany({
        where: { code: { in: u.categoryCodes } },
        select: { id: true, code: true },
      })

      const foundCodes = categories.map((c) => c.code)
      const missingCodes = u.categoryCodes.filter((c) => !foundCodes.includes(c))
      if (missingCodes.length) {
        console.warn(`⚠️  Kategori tidak ditemukan untuk ${u.email}: ${missingCodes.join(', ')}`)
      }

      categoryIds = categories.map((c) => c.id)
    }

    await prisma.user.create({
      data: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: u.role,
        categoryAccess: categoryIds.length
          ? { create: categoryIds.map((categoryId) => ({ categoryId })) }
          : undefined,
      },
    })

    console.log(`✅ ${u.role.padEnd(10)} → ${u.email}`)
  }

  console.log(`\n🌱 Selesai seeding users.`)
  console.log(`🔑 Password default untuk semua user: ${DEFAULT_PASSWORD}`)
  console.log(`⚠️  Segera ganti password setelah login pertama kali!`)
}

main()
  .catch((e) => {
    console.error('❌ Seed gagal:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
