// app/api/documents/[versionId]/download/route.ts
import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, assertDocumentAccess } from "@/lib/rbac"
import { resolveStoragePath } from "@/lib/file-storage"

// Bersihkan judul supaya aman dipakai sebagai nama file
// (hapus karakter yang tidak valid di nama file: / \ : * ? " < > |)
function sanitizeFileName(name: string): string {
  return name.replace(/[\/\\:*?"<>|]/g, "-").trim()
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ versionId: string }> }
) {
  const { versionId } = await params

  try {
    const user = await getCurrentUser()

    const version = await prisma.documentVersion.findUnique({
      where: { id: versionId },
      include: {
        document: {
          select: { categoryId: true, confidentialityLevel: true, title: true },
        },
      },
    })

    if (!version) {
      return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 404 })
    }

    await assertDocumentAccess(user, {
      categoryId: version.document.categoryId,
      confidentialityLevel: version.document.confidentialityLevel,
    })

    const absolutePath = resolveStoragePath(version.filePath)
    const fileBuffer = await readFile(absolutePath)

    const ext = version.filePath.split(".").pop()?.toLowerCase()
    const contentType =
      ext === "pdf"
        ? "application/pdf"
        : ext === "png"
        ? "image/png"
        : ext === "jpg" || ext === "jpeg"
        ? "image/jpeg"
        : ext === "doc"
        ? "application/msword"
        : ext === "docx"
        ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        : ext === "xls"
        ? "application/vnd.ms-excel"
        : ext === "xlsx"
        ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        : "application/octet-stream"

    // Nama file yang akan dilihat user saat download — dari TITLE, bukan UUID di disk
    const safeTitle = sanitizeFileName(version.document.title)
    const fileName = `${safeTitle}.${ext}`

    // encodeURIComponent supaya nama file dengan spasi/karakter unik tetap aman di header HTTP,
    // sekaligus sertakan filename biasa untuk browser lama yang tidak baca filename*
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      },
    })
  } catch (err: any) {
    if (err.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Silakan login terlebih dahulu." }, { status: 401 })
    }
    if (err.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Anda tidak memiliki akses ke berkas ini." }, { status: 403 })
    }
    console.error("Download error:", err)
    return NextResponse.json({ error: "Gagal mengunduh berkas." }, { status: 500 })
  }
}