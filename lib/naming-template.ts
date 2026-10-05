export type NamingTokens = {
  categoryCode: string;
  year: string;
  originalName: string;
  index: number;
  confidentiality?: string;
};

export function applyNamingTemplate(
  pattern: string,
  tokens: NamingTokens
): { title: string; documentNumber: string } {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');

  let result = pattern;

  // Replace tokens
  result = result.replace(/\{CATEGORY_CODE\}/g, tokens.categoryCode);
  result = result.replace(/\{YEAR\}/g, tokens.year);
  result = result.replace(/\{MONTH\}/g, month);
  result = result.replace(/\{DATE\}/g, date);
  result = result.replace(/\{ORIGINAL_NAME\}/g, tokens.originalName);
  
  // Handle padded index patterns {INDEX:3}, {INDEX:4}, etc
  result = result.replace(/\{INDEX:(\d+)\}/g, (_, digits) => {
    return String(tokens.index).padStart(parseInt(digits, 10), '0');
  });

  // Generate document number (extract format if pattern contains DOC/)
  let documentNumber = '';
  const docNumberMatch = pattern.match(/DOC\/([^\/]+)\/([^\/]+)\/\{INDEX:\d+\}/);
  if (docNumberMatch) {
    const category = docNumberMatch[1].replace(/\{CATEGORY_CODE\}/g, tokens.categoryCode);
    const year = docNumberMatch[2].replace(/\{YEAR\}/g, tokens.year);
    const indexPadding = pattern.match(/\{INDEX:(\d+)\}/)?.[1] || '3';
    const paddedIndex = String(tokens.index).padStart(parseInt(indexPadding, 10), '0');
    documentNumber = `DOC/${category}/${year}/${paddedIndex}`;
  } else {
    // Fallback: generate from category/year/index
    documentNumber = `${tokens.categoryCode}/${tokens.year}/${String(tokens.index).padStart(3, '0')}`;
  }

  return {
    title: sanitizeFilename(result),
    documentNumber: sanitizeFilename(documentNumber)
  };
}

export function sanitizeFilename(name: string): string {
  // Remove or replace invalid filename characters
  return name
    .replace(/[<>:"|?*]/g, '') // Windows invalid chars
    .replace(/\\/g, '-') // Backslash to dash
    .replace(/\//g, '-') // Forward slash to dash for title (keep for doc number)
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

export const NAMING_PRESETS = [
  {
    id: 'standard',
    label: 'Standar SIAD (Rekomendasi)',
    pattern: '[{CATEGORY_CODE}] {YEAR} - {ORIGINAL_NAME} ({INDEX:3})',
    example: '[CUR] 2026 - Modul Ajar Matematika (001)'
  },
  {
    id: 'official',
    label: 'Format Surat/Dokumen Resmi',
    pattern: 'DOC/{CATEGORY_CODE}/{YEAR}/{INDEX:3} - {ORIGINAL_NAME}',
    example: 'DOC/FIN/2026/001 - Laporan Keuangan'
  },
  {
    id: 'preserve',
    label: 'Preservasi Nama Berkas',
    pattern: '{ORIGINAL_NAME} - {YEAR}',
    example: 'Modul Ajar Matematika - 2026'
  }
] as const;
