"use client"

import * as React from "react"
import { useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Search, 
  FileText, 
  ShieldAlert, 
  Clock, 
  Archive, 
  UserCheck, 
  Lock, 
  Unlock, 
  Eye, 
  FileDown, 
  UploadCloud, 
  FolderOpen,
  AlertCircle
} from "lucide-react"

// Types matching the PRD
type UserRole = 'DIREKTUR' | 'WAKASEK' | 'GURU' | 'PEMBINA' | 'TU' | 'KEUANGAN'
type DocCategory = 'GOV' | 'CUR' | 'STU' | 'BRD' | 'HRD' | 'FIN' | 'OPS' | 'QMS' | 'COM' | 'IT'
type AccessLevel = 'FULL' | 'LOCKED'

interface CategoryItem {
  code: DocCategory
  name: string
  pic: string
  example: string
}

interface DocumentItem {
  id: string
  title: string
  documentNumber: string
  category: DocCategory
  schoolYear: string
  description: string
  tags: string[]
  confidentialityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL'
  version: string
  updatedAt: string
  isArchive: boolean
}

// 10 categories from PRD Section 2
const categories: CategoryItem[] = [
  { code: 'GOV', name: 'Tata Kelola', pic: 'Direktur / Kepala Sekolah', example: 'SOP, Renstra, SK' },
  { code: 'CUR', name: 'Kurikulum', pic: 'Wakasek Akademik', example: 'Modul Ajar, Kalender' },
  { code: 'STU', name: 'Kesiswaan', pic: 'Wakasek Kesiswaan', example: 'Data Siswa, BK' },
  { code: 'BRD', name: 'Boarding', pic: 'Kepala Boarding', example: 'Pengasuhan, Perizinan' },
  { code: 'HRD', name: 'SDM', pic: 'HR Manager', example: 'Kontrak, KPI' },
  { code: 'FIN', name: 'Keuangan', pic: 'Bendahara Sekolah', example: 'RKAS, SPJ, BOS' },
  { code: 'OPS', name: 'Operasional', pic: 'Koordinator Ops', example: 'Sarpras, Keamanan' },
  { code: 'QMS', name: 'Penjamin Mutu', pic: 'Tim Penjamin Mutu', example: 'Audit, Akreditasi' },
  { code: 'COM', name: 'Humas & Kemitraan', pic: 'Koordinator Humas', example: 'MoU, Alumni' },
  { code: 'IT', name: 'Teknologi Informasi', pic: 'Tim IT Support', example: 'Server, Backup' },
]

// Mock documents showing active & archive files
const mockDocuments: DocumentItem[] = [
  {
    id: "doc-1",
    title: "SOP Pelaksanaan Ujian Semester Ganjil",
    documentNumber: "GOV-2026-001",
    category: "CUR",
    schoolYear: "2025/2026",
    description: "Panduan standar operasional prosedur ujian semester akademik.",
    tags: ["sop", "ujian", "akademik"],
    confidentialityLevel: "INTERNAL",
    version: "v2.0",
    updatedAt: "2026-07-10 10:30",
    isArchive: false
  },
  {
    id: "doc-2",
    title: "Laporan Pertanggungjawaban Dana BOS Q1",
    documentNumber: "FIN-2026-042",
    category: "FIN",
    schoolYear: "2026",
    description: "Laporan penggunaan dana bantuan operasional sekolah triwulan pertama.",
    tags: ["bos", "keuangan", "lpj"],
    confidentialityLevel: "CONFIDENTIAL",
    version: "v1.0",
    updatedAt: "2026-06-15 14:20",
    isArchive: false
  },
  {
    id: "doc-3",
    title: "Database Induk Siswa Asrama Putra",
    documentNumber: "BRD-2026-015",
    category: "BRD",
    schoolYear: "2025/2026",
    description: "Daftar lengkap data diri dan perizinan santri asrama putra.",
    tags: ["siswa", "asrama", "santri"],
    confidentialityLevel: "CONFIDENTIAL",
    version: "v1.1",
    updatedAt: "2026-07-02 08:45",
    isArchive: false
  },
  {
    id: "doc-4",
    title: "Rencana Strategis Jangka Panjang Sekolah 2025-2030",
    documentNumber: "GOV-2025-005",
    category: "GOV",
    schoolYear: "2025/2026",
    description: "Dokumen perencanaan taktis jangka panjang yayasan.",
    tags: ["renstra", "visi", "strategi"],
    confidentialityLevel: "INTERNAL",
    version: "v1.0",
    updatedAt: "2025-12-20 16:00",
    isArchive: false
  },
  {
    id: "doc-5",
    title: "SOP Pendaftaran Siswa Baru (Arsip 2024)",
    documentNumber: "STU-2024-009",
    category: "STU",
    schoolYear: "2024",
    description: "Panduan pendaftaran siswa baru tahun lalu (Archived).",
    tags: ["psb", "pendaftaran", "siswa baru"],
    confidentialityLevel: "PUBLIC",
    version: "v1.0",
    updatedAt: "2024-05-10 11:00",
    isArchive: true
  },
  {
    id: "doc-6",
    title: "Daftar Inventaris Server & Infrastruktur IT",
    documentNumber: "IT-2026-088",
    category: "IT",
    schoolYear: "2026",
    description: "Daftar perangkat keras server sekolah dan lisensi cloud.",
    tags: ["inventaris", "server", "lisensi"],
    confidentialityLevel: "INTERNAL",
    version: "v3.0",
    updatedAt: "2026-07-14 09:15",
    isArchive: false
  }
]

export default function Page() {
  const [selectedRole, setSelectedRole] = useState<UserRole>('DIREKTUR')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'ARCHIVE'>('ALL')
  const [uploadOpen, setUploadOpen] = useState(false)

  // PRD Access Control Matrix logic (Section 3)
  const getAccessLevel = (role: UserRole, category: DocCategory): AccessLevel => {
    if (role === 'DIREKTUR') return 'FULL'
    
    switch (role) {
      case 'WAKASEK':
        return category === 'STU' ? 'FULL' : 'LOCKED' // Simulation restricted to STU for demo
      case 'GURU':
        return category === 'CUR' ? 'FULL' : 'LOCKED'
      case 'PEMBINA':
        return category === 'BRD' ? 'FULL' : 'LOCKED'
      case 'TU':
        return (category === 'GOV' || category === 'OPS') ? 'FULL' : 'LOCKED'
      case 'KEUANGAN':
        return category === 'FIN' ? 'FULL' : 'LOCKED'
      default:
        return 'LOCKED'
    }
  }

  // Filter documents based on role, search query, and tab
  const filteredDocs = mockDocuments.filter(doc => {
    // 1. Role-based view restriction
    const access = getAccessLevel(selectedRole, doc.category)
    if (access === 'LOCKED' && doc.confidentialityLevel === 'CONFIDENTIAL') {
      return false // Filter out confidential documents if user has no access to the category
    }

    // 2. Search query (FTS simulation)
    const matchesSearch = 
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.documentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    // 3. Tab active/archive
    const matchesTab = 
      activeTab === 'ALL' ||
      (activeTab === 'ACTIVE' && !doc.isArchive) ||
      (activeTab === 'ARCHIVE' && doc.isArchive)

    return matchesSearch && matchesTab
  })

  // Count stats
  const totalDocs = mockDocuments.length
  const activeDocsCount = mockDocuments.filter(d => !d.isArchive).length
  const archivedDocsCount = mockDocuments.filter(d => d.isArchive).length

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* TOP BAR / HEADER */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 bg-background/95 backdrop-blur">
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
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* SIMULATION ROLE SWITCHER (Signature Element) */}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold text-muted-foreground lg:inline-block">
              Simulasi Peran:
            </span>
            <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as UserRole)}>
              <SelectTrigger className="w-[180px] h-9 text-xs font-medium">
                <SelectValue placeholder="Pilih Peran" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIREKTUR">Direktur / Kepsek</SelectItem>
                <SelectItem value="WAKASEK">Wakasek Kesiswaan</SelectItem>
                <SelectItem value="GURU">Guru Pengajar</SelectItem>
                <SelectItem value="PEMBINA">Pembina Asrama</SelectItem>
                <SelectItem value="TU">Staf Tata Usaha</SelectItem>
                <SelectItem value="KEUANGAN">Keuangan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </header>

        {/* MAIN DASHBOARD CONTENT */}
        <main className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
          {/* STATS OVERVIEW CARDS */}
          <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Dokumen</CardTitle>
                <FileText className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-heading text-primary">{totalDocs}</div>
                <p className="text-xs text-muted-foreground mt-1">Berkas terdaftar di database</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Dokumen Aktif</CardTitle>
                <Clock className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-heading text-green-600">{activeDocsCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Versi aktif yang dapat digunakan</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Arsip Lama</CardTitle>
                <Archive className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-heading text-amber-600">{archivedDocsCount}</div>
                <p className="text-xs text-muted-foreground mt-1">Dipindahkan ke folder /Archive/</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow transition-all duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Evaluasi Semester</CardTitle>
                <ShieldAlert className="h-4 w-4 text-red-600 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-heading text-red-600">1</div>
                <p className="text-xs text-muted-foreground mt-1">Perlu review validasi dokumen</p>
              </CardContent>
            </Card>
          </section>

          {/* SCANNER / CABINETS SECTION */}
          <section className="space-y-3">
            <div className="flex flex-col gap-1">
              <h2 className="text-lg font-bold font-heading tracking-tight flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                Lemari Arsip Bidang (10 Bidang)
              </h2>
              <p className="text-xs text-muted-foreground">
                Akses lemari bidang secara logis sesuai dengan peran simulasi Anda saat ini.
              </p>
            </div>

            

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4  ">
              {categories.map((cat) => {
                const access = getAccessLevel(selectedRole, cat.code)
                const isLocked = access === 'LOCKED'

                return (
                  <Card 
                    key={cat.code} 
                    className={`relative overflow-hidden border-border/50 h-[100px] transition-all duration-200 ${
                      isLocked ? 'bg-muted/30 border-muted opacity-80' : 'bg-card border-l-4 border-l-primary hover:translate-y-[-2px] shadow-sm'
                    }`}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <span className="text-2xl font-extrabold font-heading text-foreground/80 tracking-wide">
                          {cat.code}
                        </span>
                        {/* <Badge 
                          variant={isLocked ? "destructive" : "default"} 
                          className="px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase"
                        >
                          {isLocked ? (
                            <span className="flex items-center gap-1"><Lock className="h-2.5 w-2.5" /> Terkunci</span>
                          ) : (
                            <span className="flex items-center gap-1"><Unlock className="h-2.5 w-2.5" /> Akses</span>
                          )}
                        </Badge> */}
                      </div>
                      <CardTitle className="text-sm font-bold mt-1 text-foreground/90">{cat.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 text-xs">
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                        <strong className="text-foreground/70">PIC:</strong> {cat.pic}
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                        <strong className="text-foreground/70">Berkas:</strong> {cat.example}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* SEARCH & DOCUMENTS LIST */}
          <section className="">
            {/* LEFT: Search, Filters & Actions */}
         

            {/* RIGHT: Documents Table */}
            <div className="">
              <Card className="shadow-sm h-full">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-sm font-bold">Daftar Dokumen Terbaru</CardTitle>
                      <CardDescription className="text-xs">Hasil pencarian berdasarkan filter peran saat ini.</CardDescription>
                    </div>
                    <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                      {filteredDocs.length} Berkas Ditemukan
                    </Badge>
                  </div>
                  {/* Search bar */}
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari judul, No. Surat, tag..."
                      className="pl-9 text-xs"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Filter Status tabs */}
                  <div className="flex gap-1.5 p-1 bg-muted rounded-lg text-xs font-semibold">
                    <button
                      onClick={() => setActiveTab('ALL')}
                      className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                        activeTab === 'ALL' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      Semua
                    </button>
                    <button
                      onClick={() => setActiveTab('ACTIVE')}
                      className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                        activeTab === 'ACTIVE' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      Aktif
                    </button>
                    <button
                      onClick={() => setActiveTab('ARCHIVE')}
                      className={`flex-1 py-1.5 rounded-md text-center transition-all ${
                        activeTab === 'ARCHIVE' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      Arsip
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="text-xs font-bold pl-4">Dokumen</TableHead>
                          <TableHead className="text-xs font-bold w-[80px]">Bidang</TableHead>
                          <TableHead className="text-xs font-bold w-[70px]">Versi</TableHead>
                          <TableHead className="text-xs font-bold w-[120px]">Kerahasiaan</TableHead>
                          <TableHead className="text-xs font-bold w-[80px] text-right pr-4">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody className="text-xs">
                        {filteredDocs.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground text-xs">
                              Tidak ada dokumen yang ditemukan atau Anda tidak memiliki hak akses terhadap berkas tersebut.
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredDocs.map((doc) => (
                            <TableRow key={doc.id} className="hover:bg-muted/50 transition-colors">
                              <TableCell className="pl-4 py-3">
                                <div className="font-semibold text-foreground/90">{doc.title}</div>
                                <div className="text-[10px] text-muted-foreground mt-0.5 flex gap-2">
                                  <span>No: {doc.documentNumber}</span>
                                  <span>•</span>
                                  <span>T.A: {doc.schoolYear}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="text-[10px] font-bold">
                                  {doc.category}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium font-heading text-muted-foreground">
                                {doc.version}
                              </TableCell>
                              <TableCell>
                                <Badge 
                                  variant={
                                    doc.confidentialityLevel === 'CONFIDENTIAL' ? 'destructive' :
                                    doc.confidentialityLevel === 'INTERNAL' ? 'outline' : 'secondary'
                                  }
                                  className="text-[9px] font-semibold uppercase tracking-wider"
                                >
                                  {doc.confidentialityLevel}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right pr-4">
                                <Button size="sm" variant="ghost" className="h-7 w-7 p-0" title="Buka Detail">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
