"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { saveFile, deleteFile } from "@/lib/file-storage";
import { auth } from "@/auth";
import { getCurrentUser, assertCategoryAccess, resolveCategoryIdFromCode } from '@/lib/rbac'

const db = prisma as any;

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "image/png",
  "image/jpeg",
];

const MAX_SIZE = 100 * 1024 * 1024; // 10MB

export async function getDocuments(year: string, categoryCode: string) {
  const user = await getCurrentUser()

  const [archiveYear, category] = await Promise.all([
    prisma.archiveYear.findUnique({ where: { year } }),
    prisma.category.findUnique({ where: { code: categoryCode } }),
  ])

  if (!archiveYear || !category) throw new Error('NOT_FOUND')

  await assertCategoryAccess(user, category.id)

  return prisma.document.findMany({
    where: {
      categoryId: category.id,
      schoolYearId: archiveYear.id,
    },
    include: { currentVersion: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function listDocumentsInCategoryAction(categoryCode: string, year: string) {
  const user = await getCurrentUser()

  const [categoryId, archiveYear] = await Promise.all([
    resolveCategoryIdFromCode(categoryCode),
    prisma.archiveYear.findUnique({ where: { year } }),
  ])

  if (!archiveYear) throw new Error('NOT_FOUND')

  await assertCategoryAccess(user, categoryId)

  return prisma.document.findMany({
    where: { categoryId, schoolYearId: archiveYear.id },
    include: { currentVersion: true },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function uploadDocument(
  formData: FormData,
  schoolYear: string,
  categoryCode: string,
  folderId: string | null = null   // ← TAMBAHKAN parameter ini
) {
  const formattedTitle = formData.get('formattedTitle') as string
  const documentNumber = formData.get('documentNumber') as string
  const description = formData.get("description") as string | null
  const file = formData.get("file") as File

  if (!formattedTitle) return { success: false, error: "Judul wajib diisi." }
  if (!documentNumber) return { success: false, error: "Nomor dokumen wajib diisi." }
  if (!file || file.size === 0) return { success: false, error: "File belum dipilih." }
  if (file.size > MAX_SIZE) return { success: false, error: "Ukuran file melebihi 10MB." }
  if (!ALLOWED_TYPES.includes(file.type)) return { success: false, error: "Tipe file tidak didukung." }

  const session = await auth()
  if (!session?.user?.id) return { success: false, error: "Sesi login tidak ditemukan." }

  let filePath: string | null = null
  try {
    const [category, archiveYear] = await Promise.all([
      db.category.findUnique({ where: { code: categoryCode } }),
      db.archiveYear.findUnique({ where: { year: schoolYear } }),
    ])

    if (!category) return { success: false, error: "Kategori tidak ditemukan." }
    if (!archiveYear) return { success: false, error: "Tahun ajaran tidak ditemukan." }

    await assertCategoryAccess(await getCurrentUser(), category.id)

    filePath = await saveFile(file)

    const session2 = await auth()
    if (!session2?.user?.id) return { success: false, error: "Sesi login tidak ditemukan." }
    const userId = session2.user.id

    const document = await db.$transaction(async (tx: any) => {
      const doc = await tx.document.create({
        data: {
          title: formattedTitle,
          description,
          schoolYearId: archiveYear.id,
          documentNumber,
          categoryId: category.id,
          folderId,  
        },
      })

      const version = await tx.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: "v1.0",
          filePath: filePath!,
          uploadedById: userId,
        },
      })

      return tx.document.update({
        where: { id: doc.id },
        data: { currentVersionId: version.id },
      })
    })

    revalidatePath(`/dashboard/archive/${schoolYear}/${categoryCode}`)
    return { success: true, data: document }
  } catch (err: any) {
    if (filePath) await deleteFile(filePath).catch(() => { })
    return { success: false, error: err.message || "Gagal mengunggah dokumen" }
  }
}

export async function uploadNewVersion(
  documentId: string,
  file: File,
  uploadedById: string
) {
  if (!file || file.size === 0) return { success: false, error: "File belum dipilih." }
  if (file.size > MAX_SIZE) return { success: false, error: "Ukuran file melebihi 10MB." }
  if (!ALLOWED_TYPES.includes(file.type)) return { success: false, error: "Tipe file tidak didukung." }

  let filePath: string | null = null
  try {
    const document = await db.document.findUnique({
      where: { id: documentId },
      include: { versions: true, category: true },
    });

    if (!document) throw new Error("Document tidak ditemukan.");

    const user = await getCurrentUser()
    await assertCategoryAccess(user, document.categoryId)

    filePath = await saveFile(file);

    const versionNumber = `v${document.versions.length + 1}.0`;

    await db.$transaction(async (tx: any) => {
      const version = await tx.documentVersion.create({
        data: {
          documentId,
          uploadedById,
          versionNumber,
          filePath,
        },
      });

      await tx.document.update({
        where: { id: documentId },
        data: { currentVersionId: version.id },
      });
    });

    revalidatePath("/dashboard/archive");
    return { success: true };
  } catch (err: any) {
    if (filePath) await deleteFile(filePath).catch(() => { })
    return { success: false, error: err.message || "Gagal mengunggah versi baru" };
  }
}

export async function updateDocument(
  id: string,
  data: {
    title: string;
    description?: string;
    documentNumber?: string;
  }
) {
  try {
    const document = await db.document.findUnique({ where: { id } })
    if (!document) return { success: false, error: "Dokumen tidak ditemukan." }

    const user = await getCurrentUser()
    await assertCategoryAccess(user, document.categoryId)

    await db.document.update({
      where: { id },
      data,
    });

    revalidatePath("/dashboard/archive");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah dokumen" };
  }
}

export async function deleteDocument(id: string) {
  try {
    const document = await db.document.findUnique({
      where: { id },
      include: { versions: true },
    });

    if (!document) {
      return { success: false, error: "Dokumen tidak ditemukan." };
    }

    const user = await getCurrentUser()
    await assertCategoryAccess(user, document.categoryId)

    await db.document.delete({ where: { id } });

    for (const version of document.versions) {
      await deleteFile(version.filePath).catch(() => { })
    }

    revalidatePath("/dashboard/archive");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus dokumen" };
  }
}

export async function getDocumentById(id: string) {
  try {
    const user = await getCurrentUser()

    const document = await db.document.findUnique({
      where: { id },
      include: {
        category: true,
        currentVersion: true,
        versions: {
          include: { uploadedBy: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!document) return null

    await assertCategoryAccess(user, document.categoryId)

    return document
  } catch (error) {
    console.error("Error fetching document by ID:", error);
    return null;
  }
}