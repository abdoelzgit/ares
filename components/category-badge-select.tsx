'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type Category = {
  id: string
  code: string
  name: string
}

type Props = {
  categories: Category[]
  name?: string // nama field untuk FormData, default "categoryIds"
  defaultSelectedIds?: string[] // untuk mode edit user
  label?: string
}

export function CategoryBadgeSelect({
  categories,
  name = 'categoryIds',
  defaultSelectedIds = [],
  label = 'Kategori Akses',
}: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>(defaultSelectedIds)

  function toggleCategory(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  function removeCategory(id: string) {
    setSelectedIds((prev) => prev.filter((x) => x !== id))
  }

  const selectedCategories = categories.filter((c) => selectedIds.includes(c.id))
  const unselectedCategories = categories.filter((c) => !selectedIds.includes(c.id))

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">{label}</label>

      {/* Hidden inputs — ini yang dibaca formData.getAll(name) di server action */}
      {selectedIds.map((id) => (
        <input key={id} type="hidden" name={name} value={id} />
      ))}

      {/* Badge kategori yang sudah dipilih */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-md border border-border bg-muted/30 p-3 min-h-[44px]">
          {selectedCategories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary border border-primary/30 px-3 py-1 text-xs font-medium"
            >
              {cat.code}
              <button
                type="button"
                onClick={() => removeCategory(cat.id)}
                className="hover:bg-primary/20 rounded-full p-0.5 transition"
                aria-label={`Hapus ${cat.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Daftar kategori yang belum dipilih — klik untuk menambah */}
      {unselectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {unselectedCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={cn(
                'inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 text-xs font-medium',
                'text-muted-foreground hover:border-primary hover:text-primary transition'
              )}
            >
              + {cat.code}
            </button>
          ))}
        </div>
      )}

      {categories.length === 0 && (
        <p className="text-xs text-muted-foreground">Belum ada kategori tersedia.</p>
      )}
    </div>
  )
}