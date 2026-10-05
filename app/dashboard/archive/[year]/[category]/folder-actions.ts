"use server"

import { prisma } from "@/lib/prisma"
import { getCurrentUser, assertCategoryAccess } from "@/lib/rbac"
import { revalidatePath } from "next/cache"

async function resolveCategoryAndYear(categoryCode: string, year: string) {
    const [category, archiveYear] = await Promise.all([
        prisma.category.findUnique({ where: { code: categoryCode } }),
        prisma.archiveYear.findUnique({ where: { year } }),
    ])
    if (!category || !archiveYear) throw new Error("NOT_FOUND")
    return { category, archiveYear }
}

/**
 * Ambil isi satu folder: daftar sub-folder + dokumen di dalamnya.
 * folderId = null berarti root (level teratas) kategori+tahun tersebut.
 */
export async function getFolderContents(
    categoryCode: string,
    year: string,
    folderId: string | null
) {
    const user = await getCurrentUser()
    const { category, archiveYear } = await resolveCategoryAndYear(categoryCode, year)
    await assertCategoryAccess(user, category.id)

    const [subFolders, documents] = await Promise.all([
        prisma.folder.findMany({
            where: {
                categoryId: category.id,
                schoolYearId: archiveYear.id,
                parentId: folderId,
            },
            include: { _count: { select: { documents: true, children: true } } },
            orderBy: { name: "asc" },
        }),
        prisma.document.findMany({
            where: {
                categoryId: category.id,
                schoolYearId: archiveYear.id,
                folderId: folderId,
            },
            include: { currentVersion: true },
            orderBy: { updatedAt: "desc" },
        }),
    ])

    return { subFolders, documents }
}

/**
 * Ambil rantai breadcrumb dari folder saat ini sampai ke root.
 * Contoh hasil: [{ id: 'a', name: 'Modul' }, { id: 'b', name: 'Semester 1' }]
 */
export async function getFolderBreadcrumb(
    categoryCode: string,
    year: string,
    folderId: string | null
) {
    if (!folderId) return []

    const { category, archiveYear } = await resolveCategoryAndYear(categoryCode, year)

    // 1 query ambil SEMUA folder di kategori+tahun ini (biasanya jumlahnya kecil)
    const allFolders = await prisma.folder.findMany({
        where: { categoryId: category.id, schoolYearId: archiveYear.id },  // ← pakai .id, bukan kode langsung
        select: { id: true, name: true, parentId: true },
    })

    const byId = new Map(allFolders.map((f) => [f.id, f]))
    const path: { id: string; name: string }[] = []
    let currentId: string | null = folderId

    while (currentId) {
        const folder = byId.get(currentId)
        if (!folder) break
        path.unshift({ id: folder.id, name: folder.name })
        currentId = folder.parentId
    }

    return path
}
export async function createFolder(
    categoryCode: string,
    year: string,
    name: string,
    parentId: string | null
) {
    const user = await getCurrentUser()
    const { category, archiveYear } = await resolveCategoryAndYear(categoryCode, year)
    await assertCategoryAccess(user, category.id)

    const trimmedName = name.trim()
    if (!trimmedName) return { success: false, error: "Nama folder wajib diisi." }

    try {
        // Cegah duplikat nama folder di level yang sama
        const existing = await prisma.folder.findFirst({
            where: {
                categoryId: category.id,
                schoolYearId: archiveYear.id,
                parentId,
                name: trimmedName,
            },
        })
        if (existing) {
            return { success: false, error: "Folder dengan nama ini sudah ada di lokasi ini." }
        }

        await prisma.folder.create({
            data: {
                name: trimmedName,
                categoryId: category.id,
                schoolYearId: archiveYear.id,
                parentId,
                createdById: user.id,
            },
        })

        revalidatePath(`/dashboard/archive/${year}/${categoryCode}`)
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message || "Gagal membuat folder." }
    }
}



export async function renameFolder(folderId: string, newName: string) {
    const user = await getCurrentUser()

    const folder = await prisma.folder.findUnique({ where: { id: folderId } })
    if (!folder) return { success: false, error: "Folder tidak ditemukan." }

    await assertCategoryAccess(user, folder.categoryId)

    const trimmedName = newName.trim()
    if (!trimmedName) return { success: false, error: "Nama folder wajib diisi." }

    try {
        await prisma.folder.update({
            where: { id: folderId },
            data: { name: trimmedName },
        })
        revalidatePath("/dashboard/archive")
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message || "Gagal mengubah nama folder." }
    }
}

export async function updateFolder(
    category: string,
    year: string,
    folderId: string,
    newName: string
) {
    try {
        // TODO: sesuaikan dengan ORM/query kamu (mis. prisma.folder.update)
        await prisma.folder.update({
            where: { id: folderId },
            data: { name: newName },
        })
        return { success: true }
    } catch (err) {
        console.error(err)
        return { success: false, error: "Gagal mengubah nama folder" }
    }
}


export async function deleteFolder(folderId: string) {
    const user = await getCurrentUser()

    const folder = await prisma.folder.findUnique({
        where: { id: folderId },
        include: { _count: { select: { documents: true, children: true } } },
    })
    if (!folder) return { success: false, error: "Folder tidak ditemukan." }

    await assertCategoryAccess(user, folder.categoryId)

    // Cegah hapus folder yang masih berisi sub-folder atau dokumen —
    // mencegah kehilangan data tanpa sengaja, user harus kosongkan dulu
    if (folder._count.children > 0 || folder._count.documents > 0) {
        return {
            success: false,
            error: "Folder tidak kosong. Pindahkan atau hapus isinya terlebih dahulu.",
        }
    }

    try {
        await prisma.folder.delete({ where: { id: folderId } })
        revalidatePath("/dashboard/archive")
        return { success: true }
    } catch (err: any) {
        return { success: false, error: err.message || "Gagal menghapus folder." }
    }
}