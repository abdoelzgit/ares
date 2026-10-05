export function formatDocumentTitle({
  categoryCode,
  documentNumber,
  rawTitle,
  year,
  folderPath = [],       // ← baru: nama-nama folder dari root sampai folder aktif
}: {
  categoryCode: string
  documentNumber: string
  rawTitle: string
  year: string
  folderPath?: string[]  // ← baru
}): string {
  const normalizedTitle = rawTitle
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')
    .replace(/\s+/g, '_')

  // Bagian path: Kategori/Subfolder1/Subfolder2
  const normalizedFolders = folderPath
    .map((f) => f.trim())
    .filter(Boolean)
    .map((f) =>
      f
        .toUpperCase()
        .replace(/[^A-Z0-9\s-]/g, '')
        .replace(/\s+/g, '_')
    )

  const pathPrefix = [categoryCode.toUpperCase(), ...normalizedFolders].join('/')

  // Bagian nama file: nomorsurat_judul_tahun
  const fileParts: string[] = []
  if (documentNumber.trim()) fileParts.push(documentNumber.trim())
  if (normalizedTitle) fileParts.push(normalizedTitle)
  fileParts.push(year)

  const fileName = fileParts.join('_')

  return `${pathPrefix}/${fileName}`
}