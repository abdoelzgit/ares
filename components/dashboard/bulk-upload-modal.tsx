'use client';

import * as React from 'react';
import { getAccessibleCategoriesForUser } from '@/app/dashboard/action';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { BulkFileDropzone } from './bulk-file-dropzone';
import { BulkPreviewTable } from './bulk-preview-table';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';
import { bulkUploadDocumentsAction } from '@/app/dashboard/action';

interface BulkUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function BulkUploadModal({ open, onOpenChange, onSuccess }: BulkUploadModalProps) {
  const [files, setFiles] = React.useState<File[]>([]);
  const [categoryOptions, setCategoryOptions] = React.useState<Array<{ id: string; code: string; name: string }>>(
    []
  );
  const [yearOptions, setYearOptions] = React.useState<Array<{ id: string; year: string }>>([]);
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');
  const [selectedYear, setSelectedYear] = React.useState<string>('');
  const [confidentiality, setConfidentiality] = React.useState<'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL'>(
    'INTERNAL'
  );
  const [description, setDescription] = React.useState<string>('');
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadResults, setUploadResults] = React.useState<Array<{ success: boolean; title: string; error?: string }>>(
    []
  );

  React.useEffect(() => {
    if (open) {
      getAccessibleCategoriesForUser().then((categories) => {
        setCategoryOptions(categories.map((c: any) => ({
          id: c.id,
          code: c.code,
          name: c.name,
        })));
      });

      setYearOptions([
        { id: '1', year: '2026' },
        { id: '2', year: '2025' },
      ]);
    }
  }, [open]);

  const handleFileSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleEditFile = (index: number, updates: Partial<{ file: File; previewUrl?: string; isZip?: boolean; extractedFiles?: File[] }>) => {
    console.log('Edit file', index, updates);
  };

  const handleNamingChange = (tokens: any) => {
    // Handled by BulkPreviewTable internally
  };

  const handleUpload = async () => {
    if (files.length === 0 || !selectedCategory || !selectedYear) {
      return;
    }

    setIsUploading(true);
    setUploadResults([]);

    try {
      // ponytail: implement actual file storage (local disk or cloud)
      const uploadItems = files.map((file, index) => ({
        title: file.name.replace(/\.[^/.]+$/, ''),
        documentNumber: `DOC-${index + 1}`,
        categoryId: selectedCategory,
        schoolYearId: selectedYear,
        description,
        confidentialityLevel: confidentiality,
        filePath: `/uploads/${Date.now()}_${file.name}`,
      }));

      const results = await bulkUploadDocumentsAction(uploadItems);
      setUploadResults(results);

      const successCount = results.filter(r => r.success).length;
      if (successCount > 0 && onSuccess) {
        onSuccess();
      }
      
      setIsUploading(false);
      if (successCount === results.length) {
        onOpenChange(false);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadCloud className="h-4 w-4" />
            Bulk Upload Dokumen
          </DialogTitle>
          <DialogDescription>
            Unggah banyak dokumen sekaligus dengan penamaan otomatis
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          <BulkFileDropzone onFilesSelected={handleFileSelect} />

          <div className="space-y-2">
            <label className="text-sm font-medium">Metadata Global:</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Kategori</label>
                <Select value={selectedCategory} onValueChange={(v) => v && setSelectedCategory(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        [{cat.code}] {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Tahun Ajaran</label>
                <Select value={selectedYear} onValueChange={(v) => v && setSelectedYear(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((yr) => (
                      <SelectItem key={yr.id} value={yr.id}>
                        {yr.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Kerahasiaan</label>
                <Select value={confidentiality} onValueChange={(v) => v && setConfidentiality(v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLIC">PUBLIC</SelectItem>
                    <SelectItem value="INTERNAL">INTERNAL</SelectItem>
                    <SelectItem value="CONFIDENTIAL">CONFIDENTIAL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Deskripsi</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi umum untuk semua file"
                />
              </div>
            </div>
          </div>

          {files.length > 0 && (
            <BulkPreviewTable
              files={files.map(file => ({ file }))}
              onFileRemove={handleRemoveFile}
              onFileEdit={handleEditFile}
              onNamingChange={handleNamingChange}
              categoryCode={categoryOptions.find(c => c.id === selectedCategory)?.code ?? ''}
              year={yearOptions.find(y => y.id === selectedYear)?.year ?? ''}
              confidentiality={confidentiality}
            />
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleUpload}
            disabled={isUploading || files.length === 0 || !selectedCategory || !selectedYear}
          >
            {isUploading ? 'Mengunggah...' : `Unggah ${files.length} Dokumen`}
          </Button>
        </DialogFooter>

        {uploadResults.length > 0 && !isUploading && (
          <div className="mt-4 pt-4 border-t">
            <h3 className="text-sm font-medium mb-2">Hasil Upload:</h3>
            <div className="text-xs space-y-1">
              {uploadResults.map((result, index) => (
                <div key={index} className="flex justify-between">
                  <span>{result.title}</span>
                  <span className={result.success ? 'text-green-600' : 'text-red-600'}>
                    {result.success ? 'Sukses' : `Gagal: ${result.error ?? ''}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
