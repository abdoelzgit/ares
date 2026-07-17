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
  const check = await verifyAdmin();
  if (!check.authorized) return [];

  try {
    return await db.user.findMany({
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (err) {
    console.error("Error fetching users:", err);
    return [];
  }
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
  const categoryId = formData.get("categoryId") as string | null;

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
        categoryId: categoryId === "none" || !categoryId ? null : categoryId,
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
  id: string,
  data: {
    name: string;
    email: string;
    role: UserRole;
    categoryId: string | null;
    password?: string;
  }
) {
  const check = await verifyAdmin();
  if (!check.authorized) return { success: false, error: check.error };

  try {
    const updateData: any = {
      name: data.name.trim(),
      email: data.email.trim(),
      role: data.role,
      categoryId: data.categoryId === "none" || !data.categoryId ? null : data.categoryId,
    };

    if (data.password && data.password.trim() !== "") {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    await db.user.update({
      where: { id },
      data: updateData,
    });

    revalidatePath("/dashboard/users");
    return { success: true };
  } catch (err: any) {
    console.error("Error updating user:", err);
    return { success: false, error: err.message || "Gagal memperbarui pengguna." };
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
