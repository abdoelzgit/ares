// upload-document-button.tsx
"use client"

import { useState } from "react"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { uploadDocument } from "./actions"
import { formatDocumentTitle } from "@/lib/document-format"
import { notify } from "@/lib/notify"

export function UploadDocumentButton({
    year,
    category,
    currentFolderId,
    folderPath = [],        // ← tambah ini

    onUploaded,
}: {
    year: string
    category: string
    folderPath?: string[]   // ← tambah ini

    currentFolderId: string | null
    onUploaded?: () => void
}) {
    const [open, setOpen] = useState(false)
    const [titleInput, setTitleInput] = useState("")
    const [docNumberInput, setDocNumberInput] = useState("")
    const [uploading, setUploading] = useState(false)

    const previewTitle = formatDocumentTitle({
        categoryCode: category,
        documentNumber: docNumberInput,
        rawTitle: titleInput,
        year,
        folderPath
    })

    async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setUploading(true)

        const formData = new FormData(e.currentTarget)

        try {
            const res = (await uploadDocument(formData, year, category, currentFolderId)) as any

            if (res.success) {
                setOpen(false)
                setTitleInput("")
                setDocNumberInput("")
                onUploaded?.()
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                        <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={uploading}>
                            Batal
                        </Button>
                        <Button type="submit" className="bg-primary text-white" disabled={uploading}>
                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}