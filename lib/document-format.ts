export function formatDocumentTitle({
    categoryCode,
    documentNumber,
    rawTitle,
    year
}:  {  categoryCode: string
    documentNumber: string
    rawTitle: string
    year: string
 }
): string {
  const normalizedTitle = rawTitle
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, '')  // hapus karakter selain huruf/angka/spasi
    .replace(/\s+/g, '_')          // spasi jadi underscore

  const parts = [categoryCode.toUpperCase()]
  
  if (documentNumber.trim()) {
    parts.push(documentNumber.trim())
  }

  const prefix = parts.join('-')
  
  return normalizedTitle
    ? `${prefix}_${normalizedTitle}_${year}`
    : `${prefix}_${year}`
}