// app/dashboard/dashboard-stats.tsx

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { FileText, Clock, FolderOpen } from 'lucide-react'
import { getDashboardStats } from './queries'

export async function DashboardStats() {
  const stats = await getDashboardStats()

  return (
    <section className="grid gap-4 md:grid-cols-3">
      <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Total Dokumen
          </CardTitle>
          <FileText className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-heading text-primary">{stats.totalDocs}</div>
          <p className="text-xs text-muted-foreground mt-1">Berkas yang bisa Anda akses</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Dokumen Aktif
          </CardTitle>
          <Clock className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-heading text-green-600">{stats.activeYearDocsCount}</div>
          <p className="text-xs text-muted-foreground mt-1">Tahun ajaran {stats.activeYearLabel}</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/60 shadow-sm hover:shadow transition-all duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            Kategori Diakses
          </CardTitle>
          <FolderOpen className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-heading text-blue-600">
            {stats.accessibleCategoriesCount}/{stats.totalCategories}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Bidang yang bisa Anda akses</p>
        </CardContent>
      </Card>
    </section>
  )
}