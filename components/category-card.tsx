'use client'

import Link from "next/link"
import { Card, CardHeader, CardTitle } from "./ui/card"
import {
  LockIcon,
  UnlockIcon,
  Wallet,
  Settings2,
  BedDouble,
  Megaphone,
  Users,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Server,
  Landmark,
  FolderOpen,
} from "lucide-react"
import { usePathname } from "next/navigation"

type CategoryWithAccess = {
  id: string
  code: string
  name: string
  isLocked: boolean
  fileCount: number
}

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  FIN: Wallet,
  OPS: Settings2,
  BRD: BedDouble,
  COM: Megaphone,
  HRD: Users,
  CUR: BookOpen,
  STU: GraduationCap,
  QMS: ShieldCheck,
  IT: Server,
  GOV: Landmark,
}

export function CategoryGrid({
  categories,
  year,
}: {
  categories: CategoryWithAccess[]
  year: string
}) {
  const pathname = usePathname()

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {categories.map((cat) => {
        const isCategoryActive = pathname === `/dashboard/archive/${year}/${cat.code}`
        const CategoryIcon = CATEGORY_ICONS[cat.code] ?? FolderOpen

        const cardContent = (
          <Card
            className={`relative overflow-hidden border-border/50 h-auto transition-all duration-200 ${
              isCategoryActive
                ? 'bg-primary/10 border-primary shadow-sm scale-[1.02]'
                : cat.isLocked
                  ? 'bg-muted/30 border-muted opacity-80 cursor-not-allowed'
                  : 'bg-card border-l-4 border-l-primary hover:translate-y-[-2px] hover:shadow'
            }`}
          >
            <CardHeader className=" px-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <CategoryIcon className="h-5 w-5 text-muted-foreground" />
                
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-muted-foreground">
                    {cat.fileCount} Berkas
                  </span>
                  {cat.isLocked ? (
                    <LockIcon className="h-3.5 w-3.5 text-red-500" />
                  ) : (
                    <UnlockIcon className="h-3.5 w-3.5 text-green-600" />
                  )}
                </div>
              </div>
              <CardTitle className="text-lg font-bold mt-1 text-foreground/90">
                {cat.name}
              </CardTitle>
            </CardHeader>
          </Card>
        )

        if (cat.isLocked) {
          return <div key={cat.code}>{cardContent}</div>
        }

        return (
          <Link key={cat.code} href={`/dashboard/archive/${year}/${cat.code}`} className="block">
            {cardContent}
          </Link>
        )
      })}
    </div>
  )
}