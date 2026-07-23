'use client'

import { useState } from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusIcon, Loader2 } from "lucide-react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog"
import { createArchiveYear } from '@/app/dashboard/archive/action'

export function AddYearDialog() {
  const [open, setOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [year, setYear] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const res = await createArchiveYear(year)

    if (res.success) {
      setOpen(false)
      setYear('')
    } else {
      alert(res.error)
    }

    setSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
      nativeButton={false}
        render={
          <Card className="h-48 border-border/50 overflow-hidden transition-all duration-300 hover:shadow-md hover:border-amber-500/50 bg-card hover:bg-amber-500/[0.02] flex items-center justify-center cursor-pointer">
            <div className="flex flex-col items-center gap-3 text-center">
              <PlusIcon className="h-8 w-8 p-1 border-2 rounded-full text-gray-500" />
              <p className="text-xs text-gray-500">Tambah folder tahun ajaran baru</p>
            </div>
          </Card>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tambah Tahun Ajaran Baru</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Tahun</label>
            <Input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="Contoh: 2027"
              maxLength={4}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
              Batal
            </Button>
            <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buat"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}