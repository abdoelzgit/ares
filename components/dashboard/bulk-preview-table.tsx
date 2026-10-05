'use client';

import * as React from 'react';
import { applyNamingTemplate, NamingTokens, NAMING_PRESETS } from '@/lib/naming-template';
import { X, Pencil } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface FileItem {
  file: File;
  previewUrl?: string;
  isZip?: boolean;
  extractedFiles?: File[];
}

interface BulkPreviewTableProps {
  files: FileItem[];
  onFileRemove: (index: number) => void;
  onFileEdit: (index: number, updates: Partial<FileItem>) => void;
  onNamingChange: (tokens: NamingTokens) => void;
  categoryCode: string;
  year: string;
  confidentiality: string;
}

export function BulkPreviewTable({
  files,
  onFileRemove,
  onFileEdit,
  onNamingChange,
  categoryCode,
  year,
  confidentiality,
}: BulkPreviewTableProps) {
  const [namingPattern, setNamingPattern] = React.useState<string>(
    NAMING_PRESETS[0].pattern
  );
  const [previews, setPreviews] = React.useState<Array<{
    title: string;
    documentNumber: string;
    status: 'pending' | 'valid' | 'duplicate';
    error?: string;
  }>>([]);

  React.useEffect(() => {
    if (files.length === 0) {
      setPreviews([]);
      return;
    }

    const newPreviews = files.map((fileItem, index) => {
      const baseName = fileItem.extractedFiles?.[0]?.name ?? fileItem.file.name;
      const originalName = baseName.replace(/\.[^/.]+$/, '');

      const tokens: NamingTokens = {
        categoryCode,
        year,
        originalName,
        index: index + 1,
        confidentiality,
      };

      try {
        const { title, documentNumber } = applyNamingTemplate(namingPattern, tokens);
        return {
          title,
          documentNumber,
          status: 'pending' as const,
        };
      } catch (err) {
        return {
          title: 'ERROR',
          documentNumber: 'ERROR',
          status: 'pending' as const,
          error: 'Invalid naming pattern',
        };
      }
    });

    setPreviews(newPreviews);
    if (files.length > 0) {
      const baseName = files[0].extractedFiles?.[0]?.name ?? files[0].file.name;
      onNamingChange({
        categoryCode,
        year,
        originalName: baseName.replace(/\.[^/.]+$/, ''),
        index: 1,
        confidentiality,
      });
    }
  }, [files, namingPattern, categoryCode, year, confidentiality, onNamingChange]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Template Penamaan:</label>
        <Select value={namingPattern} onValueChange={(val) => val && setNamingPattern(val)}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Pilih preset..." />
          </SelectTrigger>
          <SelectContent>
            {NAMING_PRESETS.map((preset) => (
              <SelectItem key={preset.id} value={preset.pattern}>
                {preset.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          Contoh: {NAMING_PRESETS.find(p => p.pattern === namingPattern)?.example}
        </p>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Nama File Asli</TableHead>
              <TableHead>Judul Hasil Template</TableHead>
              <TableHead className="w-[150px]">Nomor Dokumen</TableHead>
              <TableHead className="w-[80px]">Ukuran</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[80px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((fileItem, index) => {
              const preview = previews[index];
              const file = fileItem.extractedFiles?.[0] ?? fileItem.file;
              return (
                <TableRow key={index}>
                  <TableCell className="font-mono text-xs">
                    {file.name}
                    {fileItem.isZip && fileItem.extractedFiles && (
                      <span className="text-xs text-muted-foreground block">
                        ({fileItem.extractedFiles.length} file diekstrak)
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    {preview?.title ?? '-'}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {preview?.documentNumber ?? '-'}
                  </TableCell>
                  <TableCell className="text-xs">
                    {(file.size / 1024).toFixed(1)} KB
                  </TableCell>
                  <TableCell>
                    {preview?.status === 'valid' && (
                      <Badge variant="secondary">Valid</Badge>
                    )}
                    {preview?.status === 'duplicate' && (
                      <Badge variant="destructive">Duplikat</Badge>
                    )}
                    {preview?.status === 'pending' && (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onFileRemove(index)}
                      title="Hapus"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
