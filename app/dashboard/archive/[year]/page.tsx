
import * as React from "react"
import Link from "next/link"
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
import { getCurrentUser, getAccessibleCategoryIds } from '@/lib/rbac'
import { prisma } from '@/lib/prisma'
import { CategoryGrid } from "@/components/category-card"



interface PageProps {
  params: Promise<{ year: string }>
}

export default async function YearArchivePage({ params }: PageProps) {
  const {year} = await params
  const user = await getCurrentUser()

    const categories = await prisma.category.findMany()
  const accessibleIds = await getAccessibleCategoryIds(user) // undefined = semua, string[] = terbatas


  const docCounts = await prisma.document.groupBy({
    by:['categoryId'],
    where:{schoolYear: year},
    _count: {id: true}

  })
  const countMap = new Map(docCounts.map((d) => [d.categoryId, d._count.id]))

  const categoriesWithAccess = categories.map((cat) => ({
    ...cat,
    isLocked: accessibleIds !== undefined && !accessibleIds.includes(cat.id),
    fileCount: countMap.get(cat.id) ?? 0,
  }))

  
// DEBUG — hapus setelah selesai
console.log('DEBUG user:', { id: user.id, role: user.role, categoryIds: user.categoryIds })
console.log('DEBUG accessibleIds:', accessibleIds)
console.log('DEBUG categoriesWithAccess:', categoriesWithAccess.map(c => ({ code: c.code, id: c.id, isLocked: c.isLocked })))

  // PRD Access Control Matrix logic (Section 3)
  
  return (<>
  
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
                  <BreadcrumbLink href="/dashboard/archive">Arsip</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tahun {year}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          
        </header>

        {/* CONTENT */}
        <main className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
          {/* Back button and page title */}
          <div className="flex flex-col gap-3">
            
            
            <div className="flex flex-col gap-1">
              <h1 className="text-xl font-bold font-heading tracking-tight flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-600" />
                Arsip Tahun Ajaran {year}
              </h1>
              
            </div>
          </div>

          {/* CABINETS GRID (SCANNER / CABINETS SECTION) */}
          <section className="">
          
            <CategoryGrid categories={categoriesWithAccess} year={year}></CategoryGrid>
          </section>

          {/* TABLE OF DOCUMENTS */}
         
        </main>
    
  </>
  )
}
