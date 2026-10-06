"use client"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Trash2,
  Loader2,
} from "lucide-react"
// Search bar mandiri — taruh di mana saja di page.tsx, lalu kirim value+onChange-nya
// ke <DocumentTable searchQuery={...} /> supaya tabel ikut terfilter.
type DocumentSearchBarProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}
export function DocumentSearchBar({
  value,
  onChange,
  placeholder = "Cari judul atau nomor berkas...",
  className,
}: DocumentSearchBarProps) {
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-7 h-7 text-xs max-w-sm"
      />
    </div>
  )
}

export type DocumentRow = {
  id: string
  title: string
  documentNumber: string | null
  currentVersion?: {
    id: string            // ← WAJIB ada, dipakai untuk URL download /api/documents/[id]/download
    versionNumber: string
    filePath: string
  } | null
  // Opsional — hanya perlu diisi kalau tabel dipakai lintas kategori/tahun (misal di dashboard)
  category?: {
    code: string
    name: string
  }
  schoolYear?: {
    year: string
  }
}

type DocumentTableProps = {
  docs: DocumentRow[]
  loading?: boolean
  pageSize?: number
  onEdit?: (doc: DocumentRow) => void
  onDelete?: (id: string) => void
  folderPath?: string[]    
  showCategoryColumn?: boolean
  category?: string
  year?: string
  showYearColumn?: boolean
  emptyMessage?: string
  searchPlaceholder?: string
  searchQuery?: string             // ← baru: kalau diisi, search jadi "controlled" dari luar
  hideInternalSearchBar?: boolean  // ← baru: sembunyikan input manual di dalam tabel
}


export function DocumentTable({
  docs,
  loading = false,
  pageSize = 10,
  onEdit,
  onDelete,
  showCategoryColumn = false,
  showYearColumn = false,
  emptyMessage = "Tidak ada dokumen.",
  searchPlaceholder = "Cari judul atau nomor berkas...",
    folderPath = [],          // ← tambah ini

  searchQuery: externalSearchQuery,      // ← baru
  hideInternalSearchBar = false,         // ← baru
}: DocumentTableProps) {
  const isControlled = externalSearchQuery !== undefined
  const [internalSearchQuery, setInternalSearchQuery] = useState("")
  const searchQuery = isControlled ? externalSearchQuery : internalSearchQuery
  const [currentPage, setCurrentPage] = useState(1)

  const showActions = Boolean(onEdit || onDelete)

  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return docs

    const q = searchQuery.toLowerCase()
    return docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.documentNumber?.toLowerCase().includes(q) ||
        d.category?.name.toLowerCase().includes(q) ||
        d.category?.code.toLowerCase().includes(q)
    )
  }, [docs, searchQuery])

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / pageSize))

  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredDocs.slice(start, start + pageSize)
  }, [filteredDocs, currentPage, pageSize])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [totalPages, currentPage])

  const colSpan =
    2 + (showCategoryColumn ? 1 : 0) + (showYearColumn ? 1 : 0) + (showActions ? 1 : 0)

  return (
    <div>
      <div className="flex flex-col gap-2">


      {!isControlled && !hideInternalSearchBar && (
        <div className="relative p-4 pb-2">
          <Search className="absolute left-6.5 top-6.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={internalSearchQuery}
            onChange={(e) => setInternalSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs max-w-sm"
          />
        </div>
      )}
      
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Judul Dokumen</TableHead>
            {showCategoryColumn && <TableHead>Kategori</TableHead>}
            {showYearColumn && <TableHead>Tahun</TableHead>}
            <TableHead>Nomor Berkas</TableHead>
            {showActions && <TableHead className="text-right pr-4">Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody className="text-xs">
          {loading ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="text-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
              </TableCell>
            </TableRow>
          ) : paginatedDocs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={colSpan} className="text-center py-8 text-muted-foreground">
                {searchQuery ? "Tidak ada dokumen yang cocok dengan pencarian." : emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            paginatedDocs.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="pl-4 py-3 font-semibold text-foreground/90">
                  {d.title}
                </TableCell>
                {showCategoryColumn && (
                  <TableCell>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 border border-amber-500/20">
                      {d.category?.code ?? "-"}
                    </span>
                  </TableCell>
                )}
                {showYearColumn && (
                  <TableCell className="text-muted-foreground">
                    {d.schoolYear?.year ?? "-"}
                  </TableCell>
                )}
                <TableCell>{d.documentNumber || "-"}</TableCell>
                {showActions && (
                  <TableCell className="text-right pr-4 space-x-1">
                    {d.currentVersion?.id && (
                      <a
                        href={`/api/documents/${d.currentVersion.id}/download`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-8 w-8")}
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    )}
                    {onEdit && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-blue-600"
                        onClick={() => onEdit(d)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-600"
                        onClick={() => onDelete(d.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {!loading && filteredDocs.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-xs text-muted-foreground">
            Menampilkan {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, filteredDocs.length)} dari {filteredDocs.length} dokumen
          </p>
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs font-medium px-1">
              {currentPage} / {totalPages}
            </span>
            <Button
              size="icon"
              variant="outline"
              className="h-7 w-7"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
