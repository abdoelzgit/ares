"use server";

import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

const db = prisma as any;

export async function verifyAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { authorized: false, error: "Sesi login tidak ditemukan." };
  }
  const role = (session.user as any).role as UserRole;

  // Superadmin-only: DIREKTUR
  if (role !== UserRole.DIREKTUR) {
    return { authorized: false, error: "Akses ditolak. Hanya Direktur (superadmin) yang dapat mengelola pengguna." };
  }
  return { authorized: true, currentUserId: session.user.id };
}

export async function getUsers() {
  const check = await verifyAdmin()
  if (!check.authorized) return []

  const [users, roleDefaults] = await Promise.all([
    db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        categoryAccess: {
          select: {
            category: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.roleCategoryAccess.findMany({
      select: {
        role: true,
        category: {
          select: { id: true, code: true, name: true },
        },
      },
    }),
  ])

  // Map role -> daftar kategori default (dari RoleCategoryAccess)
  const roleDefaultsMap = roleDefaults.reduce((acc, r) => {
    if (!acc[r.role]) acc[r.role] = []
    acc[r.role].push(r.category)
    return acc
  }, {} as Record<string, { id: string; code: string; name: string }[]>)

  // Gabungkan: setiap user dapat field baru `defaultCategoryAccess`
  // dan `categoryAccess` tetap berisi akses personal saja (tidak diubah)
  return users.map((u) => ({
    ...u,
    defaultCategoryAccess: roleDefaultsMap[u.role] ?? [],
  }))
}

export async function getCategories() {
  const check = await verifyAdmin();
  if (!check.authorized) return [];

  try {
    return await db.category.findMany({
      orderBy: {
        name: "asc",
      },
    });
  } catch (err) {
    console.error("Error fetching categories:", err);
    return [];
  }
}

export async function createUser(formData: FormData) {
  const check = await verifyAdmin();
  if (!check.authorized) return { success: false, error: check.error };

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const role = formData.get("role") as UserRole;
  const categoryIds=formData.getAll("categoryIds") as string[];

  if (!name || !email || !password || !role) {
    return { success: false, error: "Semua kolom wajib diisi." };
  }

  try {
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "Email sudah digunakan." };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        categoryAccess: {
          create: categoryIds
          .filter((id)=> id && id !== 'none')
          .map((categoryId)=>({categoryId}))
        },
      },
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (err: any) {
    console.error("Error creating user:", err);
    return { success: false, error: err.message || "Gagal membuat pengguna." };
  }
}

export async function updateUser(
  userId: string,
  data: {
    name: string
    email: string
    role: UserRole
    categoryIds: string[]   // ganti dari categoryId: string | null
    password?: string
  }
) {
  const check = await verifyAdmin()
  if (!check.authorized) return { success: false, error: check.error }

  try {
    const existingUser = await db.user.findFirst({
      where: { email: data.email, NOT: { id: userId } },
    })
    if (existingUser) {
      return { success: false, error: 'Email sudah digunakan pengguna lain.' }
    }

    await db.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        role: data.role,
        ...(data.password ? { password: await bcrypt.hash(data.password, 10) } : {}),
        categoryAccess: {
          deleteMany: {},   // hapus semua akses lama
          create: data.categoryIds.map((categoryId) => ({ categoryId })),  // buat yang baru
        },
      },
    })

    revalidatePath('/dashboard/users')
    return { success: true }
  } catch (err: any) {
    console.error('Error updating user:', err)
    return { success: false, error: err.message || 'Gagal memperbarui pengguna.' }
  }
}

export async function deleteUser(id: string) {
  const check = await verifyAdmin();
  if (!check.authorized) return { success: false, error: check.error };

  if (check.currentUserId === id) {
    return { success: false, error: "Anda tidak dapat menghapus akun Anda sendiri." };
  }

  try {
    await db.user.delete({
      where: { id },
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting user:", err);
    return { success: false, error: err.message || "Gagal menghapus pengguna." };
  }
}
