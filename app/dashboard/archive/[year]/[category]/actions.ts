"use server";

import { prisma } from "@/lib/prisma";
import { ConfidentialityLevel } from "@prisma/client";
import { mkdir, unlink, writeFile } from "fs/promises";
import { join, extname } from "path";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const db = prisma as any;

const UPLOAD_DIR = join(process.cwd(), "public/uploads");

const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
];

async function saveFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Format file tidak didukung.");
  }

  await mkdir(UPLOAD_DIR, {
    recursive: true,
  });

  const extension = extname(file.name);
  const filename = `${randomUUID()}${extension}`;

  const filepath = join(UPLOAD_DIR, filename);

  const bytes = await file.arrayBuffer();

  await writeFile(filepath, Buffer.from(bytes));

  return `/uploads/${filename}`;
}

export async function getDocuments(
  schoolYear: string,
  categoryCode: string
) {
  try {
    return await db.document.findMany({
      where: {
        schoolYear,
        category: {
          code: categoryCode,
        },
      },
      include: {
        category: true,
        currentVersion: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return [];
  }
}

export async function uploadDocument(
  formData: FormData,
  schoolYear: string,
  categoryCode: string
) {
  const title = (formData.get("title") as string)?.trim();
  const documentNumber = (formData.get("documentNumber") as string)?.trim();
  const description = formData.get("description") as string | null;
  const file = formData.get("file") as File;
  const confidentiality =
    (formData.get("confidentialityLevel") as ConfidentialityLevel) ??
    ConfidentialityLevel.INTERNAL;

  if (!title) return { success: false, error: "Judul wajib diisi." };
  if (!documentNumber) return { success: false, error: "Nomor dokumen wajib diisi." };
  if (!file || file.size === 0) return { success: false, error: "File belum dipilih." };

  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ["application/pdf", "image/png", "image/jpeg"];
  if (file.size > MAX_SIZE) return { success: false, error: "Ukuran file melebihi 10MB." };
  if (!ALLOWED_TYPES.includes(file.type)) return { success: false, error: "Tipe file tidak didukung." };

  const session = await auth();
  if (!session?.user?.id) return { success: false, error: "Sesi login tidak ditemukan." };

  let filePath: string | null = null;
  try {
    const category = await db.category.findUnique({ where: { code: categoryCode } });
    if (!category) return { success: false, error: "Kategori tidak ditemukan." };

    filePath = await saveFile(file);

    const document = await db.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          title,
          description,
          schoolYear,
          documentNumber,
          confidentialityLevel: confidentiality,
          categoryId: category.id,
        },
      });

      const version = await tx.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: "v1.0",
          filePath: filePath!,
          uploadedById: session.user.id,
        },
      });

      return tx.document.update({
        where: { id: doc.id },
        data: { currentVersionId: version.id },
      });
    });

    revalidatePath(`/dashboard/archive/${schoolYear}/${categoryCode}`);
    return { success: true, data: document };
  } catch (err: any) {
    if (filePath) await unlink(join(process.cwd(), "public", filePath)).catch(() => {});
    return { success: false, error: err.message || "Gagal mengunggah dokumen" };
  }
}

export async function uploadNewVersion(
  documentId: string,
  file: File,
  uploadedById: string
) {
  try {
    const document = await db.document.findUnique({
      where: {
        id: documentId,
      },
      include: {
        versions: true,
      },
    });

    if (!document) throw new Error("Document tidak ditemukan.");

    const filePath = await saveFile(file);

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
        where: {
          id: documentId,
        },
        data: {
          currentVersionId: version.id,
        },
      });
    });

    revalidatePath("/dashboard/archive");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengunggah versi baru" };
  }
}

export async function updateDocument(
  id: string,
  data: {
    title: string;
    description?: string;
    documentNumber?: string;
    confidentialityLevel: ConfidentialityLevel;
  }
) {
  try {
    await db.document.update({
      where: {
        id,
      },
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
      where: {
        id,
      },
      include: {
        versions: true,
      },
    });

    if (!document) {
      return { success: false, error: "Dokumen tidak ditemukan." };
    }

    await db.document.delete({
      where: {
        id,
      },
    });

    for (const version of document.versions) {
      await unlink(join(process.cwd(), "public", version.filePath)).catch(
        () => {}
      );
    }

    revalidatePath("/dashboard/archive");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus dokumen" };
  }
}

export async function getDocumentById(id: string) {
  try {
    return await db.document.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
        currentVersion: true,
        versions: {
          include: {
            uploadedBy: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching document by ID:", error);
    return null;
  }
}