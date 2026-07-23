// app/dashboard/dashboard-documents.tsx
"use client"

import { useState, useEffect } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { DocumentTable, DocumentSearchBar } from "@/components/document-table"
import { getAccessibleCategoriesForUser, getDocumentsByCategory, getAllAccessibleDocuments } from './action'
import { FolderOpen } from "lucide-react"

type Category = { id: string; code: string; name: string }

const ALL_CATEGORIES_VALUE = "ALL"

export function DashboardDocuments() {
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>(ALL_CATEGORIES_VALUE)
    const [docs, setDocs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        getAccessibleCategoriesForUser().then(setCategories)
    }, [])

    useEffect(() => {
        setLoading(true)

        const fetchPromise =
            selectedCategory === ALL_CATEGORIES_VALUE
                ? getAllAccessibleDocuments()
                : getDocumentsByCategory(selectedCategory)

        fetchPromise.then(setDocs).finally(() => setLoading(false))
    }, [selectedCategory])

    const isShowingAll = selectedCategory === ALL_CATEGORIES_VALUE

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold font-heading tracking-tight flex items-center gap-2">
                        <FolderOpen className="h-5 w-5 text-primary" />
                        Lemari Arsip Bidang (10 Bidang)
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        Akses lemari bidang secara logis sesuai dengan peran simulasi Anda saat ini.
                    </p>
                </div>
                <div className="flex gap-2 items-center">
                    <DocumentSearchBar value={searchQuery} onChange={setSearchQuery} />

                    <Select value={selectedCategory} onValueChange={(value) => setSelectedCategory(value ?? ALL_CATEGORIES_VALUE)}>
                        <SelectTrigger className="h-9 text-xs">
                            <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_CATEGORIES_VALUE}>Semua Kategori</SelectItem>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.code}>
                                    {cat.name} ({cat.code})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <DocumentTable
                docs={docs}
                loading={loading}
                searchQuery={searchQuery}
                showCategoryColumn={isShowingAll}
                showYearColumn
                emptyMessage={
                    categories.length === 0
                        ? "Anda belum memiliki akses ke kategori manapun."
                        : "Belum ada dokumen."
                }
            />
        </div>
    )
}