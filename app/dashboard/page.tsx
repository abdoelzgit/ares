

import * as React from "react"
import Link from "next/link"
// import { useState } from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

import { SidebarTrigger } from "@/components/ui/sidebar"
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

import { DocumentTable } from "@/components/document-table"
import { DashboardDocuments } from "./document-dashboard"
import { DashboardStats } from "./dashboard-stats"


export default function Page() {
  

  return (
    <>
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
                <BreadcrumbPage>Dashboard</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* SIMULATION ROLE SWITCHER (Signature Element) */}
        <div className="flex items-center gap-3">
          {/* <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as UserRole)}>
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
            </Select> */}
        </div>
      </header>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="flex flex-1 flex-col gap-6 p-6 overflow-y-auto">
     

        {/* SCANNER / CABINETS SECTION */}
        <section className="space-y-3">
    
            <DashboardStats></DashboardStats>


        
      <DashboardDocuments />
        </section>

        {/* SEARCH & DOCUMENTS LIST */}
        <section className="">
          {/* LEFT: Search, Filters & Actions */}

        </section>
      </main>
    </>
  )
}
