import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Folder,
  FolderArchive,
  Calendar,
  Layers,
  ArrowRight
} from "lucide-react"
// import { getArchiveYears } from "./actions"

import { AddYearDialog } from "@/components/add-year-dialog"
import { getArchiveYears } from "./action"


export default async function ArchiveDirectoryPage() {
  const archiveYears = await getArchiveYears()

  return (
    <>
      {/* HEADER */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-vertical:h-4 data-vertical:self-auto"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Arsip</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto ">
        {/* Section title */}
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-bold font-heading tracking-tight flex items-center gap-2">
            <FolderArchive className="h-5 w-5 text-amber-600" />
            Direktori Arsip Historis (/Archive/)
          </h1>
          <p className="text-xs text-muted-foreground">
            Pilih tahun kalender di bawah untuk melihat kabinet bidang dan berkas dokumen terarsip pada tahun tersebut.
          </p>
        </div>

        {/* YEAR FOLDERS GRID */}
        <section className="space-y-4 pt-2">
          <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 border-b pb-2">
            <Calendar className="h-3.5 w-3.5" />
            Folder Tahun Arsip
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {archiveYears.length === 0 ? (
              <div className="col-span-full text-center py-10 text-sm text-muted-foreground border border-dashed rounded-xl">
                Belum ada tahun ajaran yang dibuat. Klik &quot;Tambah folder tahun ajaran baru&quot; di bawah untuk memulai.
              </div>
            ) : (
              archiveYears.map((yr) => (
                <Link href={`/dashboard/archive/${yr.year}`} key={yr.id} className="group">
                  <Card className="relative overflow-hidden border-border/50 transition-all duration-300 hover:shadow-md hover:border-amber-500/50 bg-card hover:bg-amber-500/[0.02]">
                    <CardHeader className="p-6 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <Folder className="h-12 w-12 text-amber-500 fill-amber-500/10 group-hover:fill-amber-500/20 group-hover:scale-105 transition-all duration-300" />
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          {yr.categoryCount} Folder
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 mt-2">
                        <CardTitle className="text-base font-extrabold font-heading flex items-center gap-1">
                          Tahun {yr.year}
                          <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 text-amber-500" />
                        </CardTitle>
                        <CardDescription className="text-xs leading-relaxed">
                          {yr.docCount} berkas dokumen tersimpan
                        </CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))
            )}

            <AddYearDialog />
          </div>
        </section>

        {/* Informative tips */}
        <section className="bg-muted/40 border rounded-xl p-5 mt-4 text-xs space-y-2">
          <h3 className="font-bold flex items-center gap-1.5 text-foreground/80">
            <Layers className="h-4 w-4 text-primary" />
            Ketentuan Penyimpanan Arsip (Tiered Storage)
          </h3>
          <ul className="list-disc pl-4 text-muted-foreground space-y-1 text-[11px] leading-relaxed">
            <li>
              Sistem memindahkan berkas di folder <strong>Archive</strong> secara otomatis ke Cold Storage (seperti AWS S3 Glacier / Cloudflare R2) jika berumur lebih dari 2 tahun untuk menghemat biaya operasional.
            </li>
            <li>
              Meskipun berkas fisik dipindahkan ke Cold Storage, metadata berkas tetap terindeks dan dapat dicari sewaktu-waktu di aplikasi.
            </li>
          </ul>
        </section>
      </main>
    </>
  )
}