"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  getDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
} from "./actions"
import { Plus, Trash2, Edit, Download, Loader2 } from "lucide-react"
import { formatDocumentTitle } from "@/lib/document-format"
import { DocumentTable, DocumentSearchBar } from "@/components/document-table"

interface PageProps {
  params: Promise<{ year: string; category: string }>
}

export default function CategoryPage({ params }: PageProps) {
  const { year, category } = use(params)
  const [titleInput, setTitleInput] = useState('')
  const [docNumberInput, setDocNumberInput] = useState('')
  const [searchQuery, setSearchQuery] = useState("")
  const [docs, setDocs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingDoc, setEditingDoc] = useState<any>(null)
  const [openUpload, setOpenUpload] = useState(false)

  const fetchDocs = async () => {
    setLoading(true)
    const data = await getDocuments(year, category)
    setDocs(data)
    setLoading(false)
  }

  const previewTitle = formatDocumentTitle({
    categoryCode: category,
    documentNumber: docNumberInput,
    rawTitle: titleInput,
    year,
  })

  useEffect(() => {
    fetchDocs()
  }, [year, category])

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await uploadDocument(formData, year, category) as any;

      if (res.success) {
        setOpenUpload(false);
        fetchDocs();
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengunggah dokumen");
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    try {
      const res = (await updateDocument(editingDoc.id, {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        documentNumber: formData.get("documentNumber") as string,
      })) as any;

      if (res.success) {
        setEditingDoc(null);
        fetchDocs();
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah dokumen");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) return;

    try {
      const res = (await deleteDocument(id)) as any;

      if (res.success) {
        fetchDocs();
      } else {
        alert(res.error);
      }
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus dokumen");
    }
  };

  return (
    <>
      <header className="flex h-16 items-center gap-2 border-b px-4">
        <div className="flex items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-vertical:h-4 data-vertical:self-auto"
            />
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
                <BreadcrumbItem>
                  <BreadcrumbPage>{category}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>


        </div>
      </header>

      <main className="p-6 space-y-4">
        <div className="flex flex-col gap-2 justify-between w-full">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-xl font-medium">
                Daftar Dokumen ({category} - {year})
              </span>
              <p className="text-xs text-gray-400 font-light">
                Lorem ipsum dolor sit amet consectetur adipisicing elit. Itaque, quos!
              </p>
            </div>

            <div className="flex items-center gap-2">
              <DocumentSearchBar value={searchQuery} onChange={setSearchQuery} />

              {/* UPLOAD DIALOG */}
              <Dialog open={openUpload} onOpenChange={setOpenUpload}>
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

                    {/* Preview format otomatis */}
                    {titleInput && (
                      <div className="rounded-md border border-dashed border-blue-300 bg-blue-50 px-3 py-2">
                        <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wide mb-0.5">
                          Preview Judul Tersimpan
                        </p>
                        <p className="text-xs font-mono text-blue-900 break-all">{previewTitle}</p>
                      </div>
                    )}

                    {/* WAJIB ADA — ini yang dibaca server action */}
                    <input type="hidden" name="formattedTitle" value={previewTitle} />

                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Berkas File</label>
                      <Input type="file" name="file" required />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setOpenUpload(false)}
                        disabled={uploading}
                      >
                        Batal
                      </Button>
                      <Button
                        type="submit"
                        className="bg-primary text-white"
                        disabled={uploading}
                      >
                        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <DocumentTable
            docs={docs}
            loading={loading}
            searchQuery={searchQuery}
            onEdit={(doc) => setEditingDoc(doc)}
            onDelete={(id) => handleDelete(id)}
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
                <Button type="submit" className="bg-primary  text-white">
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
