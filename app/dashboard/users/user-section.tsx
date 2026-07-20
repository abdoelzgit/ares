"use client"

import { useState, useEffect } from "react"
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
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  getUsers,
  getCategories,
  createUser,
  updateUser,
  deleteUser,
} from "./actions"
import { Plus, Trash2, Edit, Loader2, Users } from "lucide-react"
import { UserRole } from "@prisma/client"
import { CategoryBadgeSelect } from "@/components/category-badge-select"



export default function UsersSection() {
  const [users, setUsers] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)

  const loadData = async () => {
    setLoading(true)
    const [userData, categoryData] = await Promise.all([
      getUsers(),
      getCategories(),
    ])
    setUsers(userData)
    setCategories(categoryData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    try {
      const res = await createUser(formData)
      if (res.success) {
        setOpenAdd(false)
        loadData()
      } else {
        alert(res.error)
      }
    } catch (err) {
      console.error(err)
      alert("Gagal menambahkan pengguna.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData(e.currentTarget)
    const password = formData.get("password") as string
    const categoryIds = formData.getAll("categoryIds") as string[]  // ambil semua hidden input

    try {
      const res = await updateUser(editingUser.id, {
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        role: formData.get("role") as UserRole,
        categoryIds,   // ganti dari categoryId tunggal
        password: password !== "" ? password : undefined,
      })

      if (res.success) {
        setEditingUser(null)
        loadData()
      } else {
        alert(res.error)
      }
    } catch (err) {
      console.error(err)
      alert("Gagal memperbarui pengguna.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return

    try {
      const res = await deleteUser(id)
      if (res.success) {
        loadData()
      } else {
        alert(res.error)
      }
    } catch (err) {
      console.error(err)
      alert("Gagal menghapus pengguna.")
    }
  }

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case "DIREKTUR":
        return "destructive"
      case "TU":
        return "default"
      default:
        return "outline"
    }
  }

  return (
    <>

      {/* HEADER */}
      <header className="flex h-16 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur">
        <div className="flex items-center gap-2 w-full justify-between">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-vertical:h-4 data-vertical:self-auto" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">SIAD-Sekolah</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Kelola Pengguna</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* ADD USER DIALOG */}
          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger
              render={
                <Button size="sm" className="gap-1 bg-amber-600 hover:bg-amber-700 text-white">
                  <Plus className="h-4 w-4" /> Tambah Pengguna
                </Button>
              }
            />
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Pengguna Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4 pt-2">
                <input name="name" placeholder="Nama" required />
                <input name="email" type="email" placeholder="Email" required />
                <input name="password" type="password" placeholder="Password" required />

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Role Pengguna</label>
                  <select
                    name="role"
                    className="w-full border rounded p-2 text-xs bg-background"
                    defaultValue=""
                  >
                    <option value="" disabled>Pilih role</option>
                    <option value="DIREKTUR">DIREKTUR</option>
                    <option value="WAKASEK">WAKASEK</option>
                    <option value="GURU">GURU</option>
                    <option value="PEMBINA">PEMBINA</option>
                    <option value="TU">TU</option>
                    <option value="KEUANGAN">KEUANGAN</option>
                  </select>
                </div>

                <CategoryBadgeSelect categories={categories} />

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setOpenAdd(false)} disabled={submitting}>
                    Batal
                  </Button>
                  <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-6 space-y-4">
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-xl font-bold font-heading tracking-tight flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-600" />
            Kelola Pengguna Sistem
          </h1>
          <p className="text-xs text-muted-foreground">
            Daftar pengguna terdaftar di dalam sistem beserta manajemen peran (role) dan pembagian akses bidang masing-masing.
          </p>
        </div>

        <Card>
          <CardHeader className="py-4">
            <CardTitle className="font-heading text-base flex justify-between items-center">
              Daftar Pengguna Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Nama Pengguna</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Peran (Role)</TableHead>
                  <TableHead>Bidang / Kategori</TableHead>
                  <TableHead className="text-right pr-4">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-xs">
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Tidak ada pengguna terdaftar.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((u) => {
                    const defaultCategories = u.defaultCategoryAccess ?? []
                    const defaultIds = new Set(defaultCategories.map((c: any) => c.id))
                    const personalCategories = u.categoryAccess
                      .map((access: any) => access.category)
                      .filter((c: any) => !defaultIds.has(c.id))

                    const hasAnyAccess = defaultCategories.length > 0 || personalCategories.length > 0

                    return (
                      <TableRow key={u.id}>
                        <TableCell className="pl-4 py-3 font-semibold text-foreground/90">
                          {u.name}
                        </TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(u.role)}>
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {hasAnyAccess ? (
                            <div className="flex flex-wrap gap-1">
                              {defaultCategories.map((c: any) => (
                                <span
                                  key={c.id}
                                  title="Default dari role"
                                  className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                                >
                                  {c.name}
                                </span>
                              ))}
                              {personalCategories.map((c: any) => (
                                <span
                                  key={c.id}
                                  title="Tambahan personal"
                                  className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                                >
                                  {c.name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-muted-foreground italic">Akses Global / Tanpa Bidang</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right pr-4 space-x-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-blue-600"
                            onClick={() => setEditingUser(u)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-8 w-8 text-red-600"
                            onClick={() => handleDelete(u.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      {/* EDIT USER DIALOG */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Pengguna</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <form onSubmit={handleUpdate} className="space-y-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold">Nama Lengkap</label>
                <Input name="name" defaultValue={editingUser.name} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Email</label>
                <Input type="email" name="email" defaultValue={editingUser.email} required />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold">Password Baru (Opsional)</label>
                <Input type="password" name="password" placeholder="Kosongkan jika tidak ingin diubah" />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Role Pengguna</label>
                <select
                  name="role"
                  className="w-full border rounded p-2 text-xs bg-background"
                  defaultValue={editingUser.role}
                >
                  <option value="DIREKTUR">DIREKTUR</option>
                  <option value="WAKASEK">WAKASEK</option>
                  <option value="GURU">GURU</option>
                  <option value="PEMBINA">PEMBINA</option>
                  <option value="TU">TU</option>
                  <option value="KEUANGAN">KEUANGAN</option>
                </select>
              </div>

              <CategoryBadgeSelect
                categories={categories}
                defaultSelectedIds={editingUser.categoryAccess.map((a: any) => a.category.id)}
              />

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setEditingUser(null)} disabled={submitting}>
                  Batal
                </Button>
                <Button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

    </>
  )
}
