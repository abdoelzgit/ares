"use client"

import * as React from "react"
import { useState, use } from "react"
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
  Lock, 
  Unlock, 
  Eye, 
  ArrowLeft,
  Calendar,
  FolderArchive,
  Layers
} from "lucide-react"

type UserRole = 'DIREKTUR' | 'WAKASEK' | 'GURU' | 'PEMBINA' | 'TU' | 'KEUANGAN'
type DocCategory = 'GOV' | 'CUR' | 'STU' | 'BRD' | 'HRD' | 'FIN' | 'OPS' | 'QMS' | 'COM' | 'IT'
type AccessLevel = 'FULL' | 'LOCKED'

interface CategoryItem {
  code: DocCategory
  name: string
  pic: string
}

interface ArchivedDocument {
  id: string
  title: string
  documentNumber: string
  category: DocCategory
  year: string
  version: string
  fileSize: string
  confidentialityLevel: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL'
  archivedAt: string
}

const categories: CategoryItem[] = [
  { code: 'GOV', name: 'Tata Kelola', pic: 'Direktur / Kepala Sekolah' },
  { code: 'CUR', name: 'Kurikulum', pic: 'Wakasek Akademik' },
  { code: 'STU', name: 'Kesiswaan', pic: 'Wakasek Kesiswaan' },
  { code: 'BRD', name: 'Boarding', pic: 'Kepala Boarding' },
  { code: 'HRD', name: 'SDM', pic: 'HR Manager' },
  { code: 'FIN', name: 'Keuangan', pic: 'Bendahara Sekolah' },
  { code: 'OPS', name: 'Operasional', pic: 'Koordinator Ops' },
  { code: 'QMS', name: 'Penjamin Mutu', pic: 'Tim Penjamin Mutu' },
  { code: 'COM', name: 'Humas & Kemitraan', pic: 'Koordinator Humas' },
  { code: 'IT', name: 'Teknologi Informasi', pic: 'Tim IT Support' },
]

const mockArchivedDocs: ArchivedDocument[] = [
  // --- YEAR 2026 ---
  {
    id: "arch-26-1",
    title: "Laporan Evaluasi Program Semester Ganjil 2026",
    documentNumber: "CUR-2026-A01",
    category: "CUR",
    year: "2026",
    version: "v1.0",
    fileSize: "1.4 MB",
    confidentialityLevel: "INTERNAL",
    archivedAt: "2026-06-30"
  },
  {
    id: "arch-26-2",
    title: "Database Backup Bulanan Simpeg & Dapodik",
    documentNumber: "IT-2026-A12",
    category: "IT",
    year: "2026",
    version: "v3.1",
    fileSize: "45 MB",
    confidentialityLevel: "CONFIDENTIAL",
    archivedAt: "2026-07-01"
  },
  {
    id: "arch-26-3",
    title: "Laporan Audit Internal Keuangan Semester 1",
    documentNumber: "FIN-2026-A05",
    category: "FIN",
    year: "2026",
    version: "v1.0",
    fileSize: "2.8 MB",
    confidentialityLevel: "CONFIDENTIAL",
    archivedAt: "2026-07-05"
  },

  // --- YEAR 2025 ---
  {
    id: "arch-25-1",
    title: "Rencana Pembelajaran Semester (RPS) 2025",
    documentNumber: "CUR-2025-A03",
    category: "CUR",
    year: "2025",
    version: "v1.2",
    fileSize: "980 KB",
    confidentialityLevel: "INTERNAL",
    archivedAt: "2025-12-15"
  },
  {
    id: "arch-25-2",
    title: "Surat Keputusan (SK) Pengangkatan Pengajar Asrama",
    documentNumber: "GOV-2025-A10",
    category: "GOV",
    year: "2025",
    version: "v1.0",
    fileSize: "1.1 MB",
    confidentialityLevel: "INTERNAL",
    archivedAt: "2025-08-01"
  },
  {
    id: "arch-25-3",
    title: "Laporan Pemeliharaan Sarana Gedung Utama",
    documentNumber: "OPS-2025-A08",
    category: "OPS",
    year: "2025",
    version: "v1.0",
    fileSize: "3.4 MB",
    confidentialityLevel: "PUBLIC",
    archivedAt: "2025-11-20"
  },

  // --- YEAR 2024 ---
  {
    id: "arch-24-1",
    title: "SOP PSB Online Terintegrasi (Lama)",
    documentNumber: "STU-2024-A02",
    category: "STU",
    year: "2024",
    version: "v1.0",
    fileSize: "2.2 MB",
    confidentialityLevel: "PUBLIC",
    archivedAt: "2024-06-10"
  },
  {
    id: "arch-24-2",
    title: "Buku Anggaran RKAS Sekolah 2024",
    documentNumber: "FIN-2024-A01",
    category: "FIN",
    year: "2024",
    version: "v2.0",
    fileSize: "4.1 MB",
    confidentialityLevel: "CONFIDENTIAL",
    archivedAt: "2024-12-28"
  },
  {
    id: "arch-24-3",
    title: "Laporan Akreditasi & Penjaminan Mutu Sekolah 2024",
    documentNumber: "QMS-2024-A04",
    category: "QMS",
    year: "2024",
    version: "v1.0",
    fileSize: "5.6 MB",
    confidentialityLevel: "INTERNAL",
    archivedAt: "2024-10-05"
  }
]

interface PageProps {
  params: Promise<{ year: string }>
}

export default function YearArchivePage({ params }: PageProps) {
  const resolvedParams = use(params)
  const year = resolvedParams.year

  const [selectedRole, setSelectedRole] = useState<UserRole>('DIREKTUR')
  const [activeCategory, setActiveCategory] = useState<DocCategory | null>(null)

  // PRD Access Control Matrix logic (Section 3)
  const getAccessLevel = (role: UserRole, category: DocCategory): AccessLevel => {
    if (role === 'DIREKTUR') return 'FULL'
    
    switch (role) {
      case 'WAKASEK':
        return category === 'STU' ? 'FULL' : 'LOCKED'
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

  // Get documents count inside specific year and category (accounting for role access)
  const getCategoryDocCount = (category: DocCategory): number => {
    const access = getAccessLevel(selectedRole, category)
    return mockArchivedDocs.filter(doc => {
      if (doc.year !== year || doc.category !== category) return false
      if (access === 'LOCKED' && doc.confidentialityLevel === 'CONFIDENTIAL') return false
      return true
    }).length
  }

  // Get list of active visible files
  const activeDocs = mockArchivedDocs.filter(doc => {
    if (doc.year !== year) return false
    if (activeCategory && doc.category !== activeCategory) return false
    
    const access = getAccessLevel(selectedRole, doc.category)
    if (access === 'LOCKED' && doc.confidentialityLevel === 'CONFIDENTIAL') return false
    
    return true
  })

  const yearCount = mockArchivedDocs.filter(d => d.year === year).length

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* HEADER */}
        <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background/95 backdrop-blur">
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
                  <BreadcrumbPage>Tahun {year}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Role switcher simulation */}
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-semibold text-muted-foreground lg:inline-block">
              Simulasi Peran:
            </span>
            <Select value={selectedRole} onValueChange={(val) => {
              setSelectedRole(val as UserRole)
              setActiveCategory(null)
            }}>
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

        {/* CONTENT */}
        <main className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
          {/* Back button and page title */}
          <div className="flex flex-col gap-3">
            <a href="/dashboard/archive">
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 -ml-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Indeks Arsip
              </Button>
            </a>
            
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold font-heading tracking-tight flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                Arsip Tahun Ajaran {year}
              </h1>
              <p className="text-xs text-muted-foreground">
                Total {yearCount} berkas tersimpan di dalam folder `/Archive/{year}/` untuk tahun ini.
              </p>
            </div>
          </div>

          {/* CABINETS GRID (SCANNER / CABINETS SECTION) */}
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                Lemari Bidang (Tahun {year})
              </h2>
              {activeCategory && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveCategory(null)}
                  className="h-7 text-[11px] font-semibold text-primary gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Lihat Semua Lemari
                </Button>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((cat) => {
                const access = getAccessLevel(selectedRole, cat.code)
                const isLocked = access === 'LOCKED'
                const isCategoryActive = activeCategory === cat.code
                const fileCount = getCategoryDocCount(cat.code)

                return (
                  <Card 
                    key={cat.code}
                    onClick={() => {
                      if (!isLocked) {
                        setActiveCategory(isCategoryActive ? null : cat.code)
                      }
                    }}
                    className={`relative overflow-hidden cursor-pointer border-border/50 h-[100px] transition-all duration-200 ${
                      isCategoryActive 
                        ? 'bg-primary/10 border-primary shadow-sm scale-[1.02]' 
                        : isLocked 
                          ? 'bg-muted/30 border-muted opacity-80 cursor-not-allowed' 
                          : 'bg-card border-l-4 border-l-primary hover:translate-y-[-2px] hover:shadow'
                    }`}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <span className="text-2xl font-extrabold font-heading text-foreground/80 tracking-wide">
                          {cat.code}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {fileCount} Berkas
                          </span>
                          {isLocked ? (
                            <Lock className="h-3.5 w-3.5 text-red-500" />
                          ) : (
                            <Unlock className="h-3.5 w-3.5 text-green-600" />
                          )}
                        </div>
                      </div>
                      <CardTitle className="text-sm font-bold mt-1 text-foreground/90">{cat.name}</CardTitle>
                    </CardHeader>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* TABLE OF DOCUMENTS */}
          <section className="pt-2">
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-sm font-bold">
                      {activeCategory 
                        ? `Daftar Berkas Terarsip: Bidang ${activeCategory} (Tahun ${year})` 
                        : `Semua Berkas Terarsip Tahun ${year}`
                      }
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Menampilkan semua berkas arsip historis yang dapat Anda akses berdasarkan simulasi peran saat ini.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                    {activeDocs.length} Berkas Ditemukan
                  </Badge>
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
                        <TableHead className="text-xs font-bold w-[90px]">Ukuran File</TableHead>
                        <TableHead className="text-xs font-bold w-[80px] text-right pr-4">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {activeDocs.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-10 text-muted-foreground text-xs">
                            Tidak ada berkas terarsip di folder ini yang dapat diakses oleh peran Anda.
                          </TableCell>
                        </TableRow>
                      ) : (
                        activeDocs.map((doc) => (
                          <TableRow key={doc.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell className="pl-4 py-3">
                              <div className="font-semibold text-foreground/90">{doc.title}</div>
                              <div className="text-[10px] text-muted-foreground mt-0.5 flex gap-2">
                                <span>No: {doc.documentNumber}</span>
                                <span>•</span>
                                <span>Diarsipkan: {doc.archivedAt}</span>
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
                            <TableCell className="text-muted-foreground font-medium">
                              {doc.fileSize}
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
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
