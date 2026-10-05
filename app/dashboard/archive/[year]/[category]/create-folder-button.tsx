// app/dashboard/archive/[year]/[category]/create-folder-button.tsx
"use client"

import { useState } from "react"
import { FolderPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { createFolder } from "./folder-actions"

export function CreateFolderButton({
  year,
  category,
  currentFolderId,
  onCreated,
}: {
  year: string
  category: string
  currentFolderId: string | null
  onCreated?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [creating, setCreating] = useState(false)

  async function handleCreateFolder(e: React.FormEvent) {
    e.preventDefault()
    setCreating(true)
    const res = await createFolder(category, year, name, currentFolderId)
    if (res.success) {
      setOpen(false)
      setName("")
      onCreated?.()
    } else {
      alert(res.error) // ganti notify.error(...) kalau sudah pakai toast
    }
    setCreating(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button size="sm" variant="outline" className="gap-1 h-8 text-xs">
            <FolderPlus className="h-3.5 w-3.5" /> Folder Baru
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Buat Folder Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreateFolder} className="space-y-4 pt-2">
          <Input
            placeholder="Nama folder"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={creating}>
              Batal
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buat"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}