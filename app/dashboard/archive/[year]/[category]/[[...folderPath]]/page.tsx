"use client"

import { use, useState, useEffect } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FolderBrowser } from "../folder-browser"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getFolderBreadcrumb } from "../folder-actions"

import { uploadDocument, updateDocument, deleteDocument } from "../actions"
import { Plus, Loader2 } from "lucide-react"
import { formatDocumentTitle } from "@/lib/document-format"
import { notify } from "@/lib/notify"
import { CreateFolderButton } from "../create-folder-button"
import { DocumentSearchBar } from "@/components/document-table"

interface PageProps {
  params: Promise<{ year: string; category: string; folderPath?: string[] }>
}

export default function CategoryPage({ params }: PageProps) {
  const { year, category, folderPath } = use(params)

  // Segment terakhir dari folderPath = ID folder yang sedang dibuka.
  // undefined/[] (root kategori) => null
  const currentFolderId =
    folderPath && folderPath.length > 0 ? folderPath[folderPath.length - 1] : null
  const [searchQuery, setSearchQuery] = useState("")
  const [titleInput, setTitleInput] = useState("")
  const [docNumberInput, setDocNumberInput] = useState("")
  const [uploading, setUploading] = useState(false)
  const [editingDoc, setEditingDoc] = useState<any>(null)
  const [openUpload, setOpenUpload] = useState(false)
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>([])


  useEffect(() => {
    let cancelled = false
    getFolderBreadcrumb(category, year, currentFolderId).then((crumb) => {
      if (!cancelled) setBreadcrumb(crumb)
    })
    return () => {
      cancelled = true
    }
  }, [currentFolderId, category, year])

  // Dipakai untuk memaksa FolderBrowser refetch setelah upload/edit/hapus
  const [refreshToken, setRefreshToken] = useState(0)
  const triggerRefresh = () => setRefreshToken((t) => t + 1)

  const previewTitle = formatDocumentTitle({
    categoryCode: category,
    documentNumber: docNumberInput,
    rawTitle: titleInput,
    year,
    folderPath: breadcrumb.map((b) => b.name),  // ← derive dari breadcrumb, bukan state terpisah
  })
const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault()
  setUploading(true)

  const formData = new FormData(e.currentTarget)

  try {
    const res = (await uploadDocument(formData, year, category, currentFolderId)) as any

    if (res.success) {
      setOpenUpload(false)
      setTitleInput("")
      setDocNumberInput("")
      triggerRefresh()
      notify.success("Dokumen berhasil diunggah")
    } else {
      notify.error(res.error ?? "Gagal mengunggah dokumen")
    }
  } catch (err) {
    console.error(err)
    notify.error("Gagal mengunggah dokumen")
  } finally {
    setUploading(false)
  }
}

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    try {
      const res = (await updateDocument(editingDoc.id, {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        documentNumber: formData.get("documentNumber") as string,
      })) as any

      if (res.success) {
        setEditingDoc(null)
        triggerRefresh()
        notify.success("Dokumen berhasil diedit")
      } else {
        notify.error(res.error ?? "Gagal edit dokumen")
      }
    } catch (err) {
      console.error(err)
      notify.error("Gagal edit dokumen")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) return

    try {
      const res = (await deleteDocument(id)) as any
      if (res.success) {
        triggerRefresh()
        notify.success("Dokumen berhasil dihapus")
      } else {
        notify.error(res.error ?? "Gagal menghapus dokumen")
      }
    } catch (err) {
      console.error(err)
      notify.error("Gagal menghapus dokumen")
    }
  }

  return (
    <>
      <header className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard/archive">Arsip</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink href={`/dashboard/archive/${year}`}>Tahun {year}</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />

                {/* Kategori — jadi link kalau lagi di dalam folder, jadi current page kalau di root kategori */}
                <BreadcrumbItem>
                  {breadcrumb.length > 0 ? (
                    <BreadcrumbLink href={`/dashboard/archive/${year}/${category}`}>
                      {category}
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{category}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>

                {/* Folder path dinamis */}
                {breadcrumb.map((crumb, i) => (
                  <span key={crumb.id} className="flex items-center gap-1.5">
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {i === breadcrumb.length - 1 ? (
                        <BreadcrumbPage>{crumb.name}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={`/dashboard/archive/${year}/${category}/${crumb.id}`}>
                          {crumb.name}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </span>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <DocumentSearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            className="w-64"
          />
        </div>
      </header>

      <main className="p-6 space-y-4">
        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-medium">
                Daftar Dokumen ({category} - {year})
              </span>
              <p className="text-xs text-gray-400 font-light">
                Kelola folder dan dokumen untuk bidang {category} tahun ajaran {year}.
              </p>
            </div>

            {/* UPLOAD DIALOG */}
            <div className="flex gap-2">
              <CreateFolderButton
                year={year}
                category={category}
                currentFolderId={currentFolderId}
                onCreated={triggerRefresh}
              />            <Dialog open={openUpload} onOpenChange={setOpenUpload}>
                <DialogTrigger
                  render={
                    <Button className="gap-1 p-4 bg-primary text-white">
                      <Plus className="h-4 w-4" /> Baru
                    </Button>
                  }
                />
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      Unggah Dokumen Baru ({category} - {year})
                    </DialogTitle>
                  </DialogHeader>

                  <form onSubmit={handleUpload} className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Judul Dokumen</label>
                      <Input
                        name="title"
                        value={titleInput}
                        onChange={(e) => setTitleInput(e.target.value)}
                        placeholder="Contoh: Modul Ajar Matematika"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Nomor Berkas (Opsional)</label>
                      <Input
                        name="documentNumber"
                        value={docNumberInput}
                        onChange={(e) => setDocNumberInput(e.target.value)}
                        placeholder="Contoh: CUR-2026-001"
                      />
                    </div>

                    {titleInput && (
                      <div className="rounded-md border border-dashed border-blue-300 bg-blue-50 px-3 py-2">
                        <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide mb-0.5">
                          Preview Judul Tersimpan
                        </p>
                        <p className="text-xs font-mono text-blue-900 break-all">{previewTitle}</p>
                      </div>
                    )}

                    <input type="hidden" name="formattedTitle" value={previewTitle} />

                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Berkas File</label>
                      <Input type="file" name="file" required />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button type="button" variant="outline" onClick={() => setOpenUpload(false)} disabled={uploading}>
                        Batal
                      </Button>
                      <Button type="submit" className="bg-primary text-white" disabled={uploading}>
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* FolderBrowser sudah menampilkan folder + dokumen level ini — TIDAK perlu DocumentTable terpisah lagi di sini */}
          <FolderBrowser
            key={refreshToken}
            year={year}
            category={category}
            currentFolderId={currentFolderId}
            searchQuery={searchQuery}
            breadcrumb={breadcrumb}
            onEditDocument={(doc) => setEditingDoc(doc)}
            onDeleteDocument={handleDelete}
          />
        </div>
      </main>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingDoc} onOpenChange={(open) => !open && setEditingDoc(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Dokumen</DialogTitle>
          </DialogHeader>
          {editingDoc && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Judul Dokumen</label>
                <Input name="title" defaultValue={editingDoc.title} required />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Nomor Berkas</label>
                <Input name="documentNumber" defaultValue={editingDoc.documentNumber ?? ""} placeholder="Contoh: CUR-2026-001" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingDoc(null)}>
                  Batal
                </Button>
                <Button type="submit" className="bg-primary text-white">
                  Simpan
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}