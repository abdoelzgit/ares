"use client"

import { use, useState, useEffect, useTransition } from "react"
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
import { ConfidentialityLevel } from "@prisma/client"

interface PageProps {
  params: Promise<{ year: string; category: string }>
}

export default function CategoryPage({ params }: PageProps) {
  const { year, category } = use(params)
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
      confidentialityLevel: formData.get(
        "confidentialityLevel"
      ) as ConfidentialityLevel,
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
                    <BreadcrumbLink href="/dashboard">SIAD-Sekolah</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink href="/dashboard/archive">Historical Archive</BreadcrumbLink>
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

            {/* UPLOAD DIALOG */}
            <Dialog open={openUpload} onOpenChange={setOpenUpload}>
              <DialogTrigger render={<Button size="sm" className="gap-1 bg-amber-600 hover:bg-amber-700 text-white"><Plus className="h-4 w-4" /> Unggah Dokumen</Button>} />
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Unggah Dokumen Baru ({category} - {year})</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpload} className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Judul Dokumen</label>
                    <Input name="title" placeholder="Contoh: Modul Ajar Matematika" required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Nomor Berkas (Opsional)</label>
                    <Input name="documentNumber" placeholder="Contoh: CUR-2026-001" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Tingkat Kerahasiaan</label>
                    <select
                      name="confidentialityLevel"
                      className="w-full border rounded p-2 text-xs bg-background"
                      defaultValue="INTERNAL"
                    >
                      <option value="PUBLIC">PUBLIC</option>
                      <option value="INTERNAL">INTERNAL</option>
                      <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Berkas File</label>
                    <Input type="file" name="file" required />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setOpenUpload(false)} disabled={uploading}>
                      Batal
                    </Button>
                    <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={uploading}>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <main className="p-6 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-base flex justify-between items-center">
                Daftar Dokumen Aktif: {category} ({year})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Judul Dokumen</TableHead>
                    <TableHead>Nomor Berkas</TableHead>
                    <TableHead>Versi</TableHead>
                    <TableHead>Kerahasiaan</TableHead>
                    <TableHead className="text-right pr-4">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-xs">
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ) : docs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Tidak ada dokumen dalam bidang ini.
                      </TableCell>
                    </TableRow>
                  ) : (
                    docs.map((d) => (
                      <TableRow key={d.id}>
                        <TableCell className="pl-4 py-3 font-semibold text-foreground/90">
                          {d.title}
                        </TableCell>
                        <TableCell>{d.documentNumber || "-"}</TableCell>
                        <TableCell className="font-heading text-muted-foreground">
                          {d.currentVersion?.versionNumber || "v1.0"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={d.confidentialityLevel === "CONFIDENTIAL" ? "destructive" : "outline"}>
                            {d.confidentialityLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-4 space-x-1">
                          {d.currentVersion?.filePath && (
                            <a
                              href={d.currentVersion.filePath}
                              download
                              target="_blank"
                              rel="noopener noreferrer"
                              className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
                            >
                              <Download className="h-4 w-4" />
                            </a>
                          )}
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600" onClick={() => setEditingDoc(d)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-600" onClick={() => handleDelete(d.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
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
                  <label className="text-xs font-semibold">Tingkat Kerahasiaan</label>
                  <select
                    name="confidentialityLevel"
                    className="w-full border rounded p-2 text-xs bg-background"
                    defaultValue={editingDoc.confidentialityLevel}
                  >
                    <option value="PUBLIC">PUBLIC</option>
                    <option value="INTERNAL">INTERNAL</option>
                    <option value="CONFIDENTIAL">CONFIDENTIAL</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setEditingDoc(null)}>
                    Batal
                  </Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white">
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
