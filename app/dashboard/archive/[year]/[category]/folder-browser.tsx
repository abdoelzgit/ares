// app/dashboard/archive/[year]/[category]/folder-browser.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Folder, Loader2, Pencil, Trash2, AlertTriangle, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { DocumentTable } from "@/components/document-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    getFolderContents,
    updateFolder,
    deleteFolder,
} from "./folder-actions"

export function FolderBrowser({
    year,
    category,
    currentFolderId,
    searchQuery,
    breadcrumb,
    onEditDocument,
    onDeleteDocument,
    uploadItems = [],
}: {
    year: string
    category: string
    currentFolderId: string | null
    searchQuery?: string
    breadcrumb: { id: string; name: string }[]
    onEditDocument?: (doc: any) => void
    onDeleteDocument?: (id: string) => void
    uploadItems?: Array<{ name: string; status: "pending" | "uploading" | "success" | "error"; error?: string }>
}) {
    const router = useRouter()

    const [subFolders, setSubFolders] = useState<any[]>([])
    const [documents, setDocuments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Edit folder
    const [editingFolder, setEditingFolder] = useState<{ id: string; name: string } | null>(null)
    const [editName, setEditName] = useState("")
    const [savingEdit, setSavingEdit] = useState(false)

    // Delete folder
    const [deletingFolder, setDeletingFolder] = useState<{ id: string; name: string; count: number } | null>(null)
    const [deleting, setDeleting] = useState(false)

    async function loadContents() {
        setLoading(true)
        const { subFolders, documents } = await getFolderContents(category, year, currentFolderId)
        setSubFolders(subFolders)
        setDocuments(documents)
        setLoading(false)
    }

    useEffect(() => {
        loadContents()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentFolderId, category, year])

    function navigateToFolder(folderId: string | null) {
        const base = `/dashboard/archive/${year}/${category}`
        router.push(folderId ? `${base}/${folderId}` : base)
    }

    function openEdit(e: React.MouseEvent, folder: any) {
        e.stopPropagation() // jangan sampai trigger navigateToFolder
        setEditingFolder({ id: folder.id, name: folder.name })
        setEditName(folder.name)
    }

    async function handleEditFolder(e: React.FormEvent) {
        e.preventDefault()
        if (!editingFolder) return
        setSavingEdit(true)
        const res = await updateFolder(category, year, editingFolder.id, editName)
        if (res.success) {
            setEditingFolder(null)
            loadContents()
        } else {
            alert(res.error)
        }
        setSavingEdit(false)
    }

    function openDelete(e: React.MouseEvent, folder: any) {
        e.stopPropagation()
        const totalItems = (folder._count?.children ?? 0) + (folder._count?.documents ?? 0)
        setDeletingFolder({ id: folder.id, name: folder.name, count: totalItems })
    }

    async function handleDeleteFolder() {
        if (!deletingFolder) return
        setDeleting(true)
        const res = await deleteFolder(deletingFolder.id)
        if (res.success) {
            setDeletingFolder(null)
            loadContents()
        } else {
            alert(res.error)
        }
        setDeleting(false)
    }

    return (
        <div className="space-y-4">
          

            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Folder</h3>
            </div>

            {loading ? (
                <div className="py-8 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                </div>
            ) : (
                <>
                    {subFolders.length > 0 && (
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {subFolders.map((folder) => (
                                <Card
                                    key={folder.id}
                                    className="group relative cursor-pointer hover:shadow hover:border-primary/50 transition-all"
                                    onClick={() => navigateToFolder(folder.id)}
                                >
                                    <CardHeader className="p-3 flex flex-row items-center gap-2 space-y-0">
                                        <Folder className="h-5 w-5 text-amber-500 fill-amber-500/20 shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-xs font-semibold truncate">{folder.name}</CardTitle>
                                            <p className="text-[10px] text-muted-foreground">
                                                {folder._count.children} folder, {folder._count.documents} dokumen
                                            </p>
                                        </div>

                                        {/* Tombol edit/delete — muncul saat hover, tidak trigger navigasi */}
                                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-muted-foreground hover:text-blue-600"
                                                onClick={(e) => openEdit(e, folder)}
                                            >
                                                <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-6 w-6 text-muted-foreground hover:text-red-600"
                                                onClick={(e) => openDelete(e, folder)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    )}

                    {uploadItems.length > 0 && (
                        <div className="overflow-hidden rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dokumen upload</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {uploadItems.map((item, index) => (
                                        <TableRow key={`${item.name}-${index}`}>
                                            <TableCell className="font-medium">{item.name}</TableCell>
                                            <TableCell className={
                                                item.status === "success" ? "text-right text-green-600" :
                                                item.status === "error" ? "text-right text-red-600" :
                                                item.status === "uploading" ? "text-right text-blue-600" :
                                                "text-right text-muted-foreground"
                                            }>
                                                {item.status === "pending" ? "Menunggu" :
                                                 item.status === "uploading" ? "Mengunggah" :
                                                 item.status === "success" ? "Berhasil" : item.error}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    <DocumentTable
                        docs={documents}
                        onEdit={onEditDocument}
                        searchQuery={searchQuery}
                        onDelete={onDeleteDocument}
                        emptyMessage="Tidak ada dokumen di folder ini."
                    />
                </>
            )}

            {/* DIALOG EDIT FOLDER */}
            <Dialog open={!!editingFolder} onOpenChange={(open) => !open && setEditingFolder(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Ubah Nama Folder</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEditFolder} className="space-y-4 pt-2">
                        <Input
                            placeholder="Nama folder"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            required
                            autoFocus
                        />
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setEditingFolder(null)} disabled={savingEdit}>
                                Batal
                            </Button>
                            <Button type="submit" disabled={savingEdit}>
                                {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* DIALOG PERINGATAN HAPUS FOLDER */}
            <Dialog open={!!deletingFolder} onOpenChange={(open) => !open && setDeletingFolder(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                            Hapus Folder
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3 pt-1">
                        <p className="text-sm">
                            Yakin ingin menghapus folder <span className="font-semibold">"{deletingFolder?.name}"</span>?
                        </p>
                        {deletingFolder && deletingFolder.count > 0 && (
                            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2">
                                <p className="text-xs text-red-700">
                                    Folder ini berisi <span className="font-semibold">{deletingFolder.count} item</span> (sub-folder
                                    dan/atau dokumen). Semua isinya akan <span className="font-semibold">ikut terhapus permanen</span> dan
                                    tidak bisa dikembalikan.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={() => setDeletingFolder(null)} disabled={deleting}>
                            Batal
                        </Button>
                        <Button
                            type="button"
                            className="bg-red-600 text-white hover:bg-red-700"
                            onClick={handleDeleteFolder}
                            disabled={deleting}
                        >
                            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ya, Hapus Folder"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
