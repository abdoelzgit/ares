'use client';

import * as React from 'react';
import * as JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { UploadCloud } from 'lucide-react';

export interface FileItem {
  file: File;
  previewUrl?: string;
  isZip?: boolean;
  extractedFiles?: File[];
}

interface BulkFileDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string[];
  maxFileSizeMB?: number;
  maxFiles?: number;
}

export function BulkFileDropzone({
  onFilesSelected,
  accept = ['.pdf', '.docx', '.png', '.jpg', '.jpeg'],
  maxFileSizeMB = 10,
  maxFiles = 50,
}: BulkFileDropzoneProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [files, setFiles] = React.useState<FileItem[]>([]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    await processFiles(droppedFiles);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    await processFiles(selectedFiles);
    e.target.value = '';
  };

  const processFiles = async (inputFiles: FileList | File[]) => {
    const fileArray = Array.from(inputFiles);
    let validFiles: FileItem[] = [];

    for (const file of fileArray) {
      const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
      if (!accept.includes(ext) && ext !== '.zip') {
        continue;
      }

      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > maxFileSizeMB) {
        continue;
      }

      validFiles.push({ file, isZip: ext === '.zip' });
    }

    const processedFiles: FileItem[] = [];
    for (const item of validFiles) {
      if (item.isZip) {
        try {
          const zip = await JSZip.loadAsync(item.file);
          const zipPromises = Object.entries(zip.files)
            .filter(([, file]) => !file.dir)
            .map(async ([name, file]) => {
              const content = await file.async('blob');
              return new File([content], name, {
                type: content.type,
                lastModified: Date.now(),
              });
            });

          const extracted = await Promise.all(zipPromises);
          const filteredExtracted = extracted.filter((file) => {
            const ext = `.${file.name.split('.').pop()?.toLowerCase() ?? ''}`;
            return accept.includes(ext);
          });

          if (filteredExtracted.length > 0) {
            processedFiles.push({
              file: item.file,
              extractedFiles: filteredExtracted,
            });
          }
        } catch (err) {
          console.error(err);
        }
      } else {
        processedFiles.push(item);
      }
    }

    const totalFiles = processedFiles.reduce(
      (sum, item) => sum + (item.extractedFiles?.length ?? 1),
      0
    );

    if (totalFiles > maxFiles) {
      return;
    }

    setFiles(processedFiles);
    const flatFiles = processedFiles.reduce<File[]>((acc, item) => {
      return acc.concat(item.extractedFiles ?? [item.file]);
    }, []);
    onFilesSelected(flatFiles);
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-muted hover:border-muted/80'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept.join(',')}
        className="hidden"
        onChange={handleFileSelect}
      />
      <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
        <UploadCloud className="mr-2 h-4 w-4" />
        Pilih File atau Seret ke Sini
      </Button>
      <p className="mt-2 text-sm text-muted-foreground">
        Format yang didukung: {accept.join(', ')} dan .zip
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        Maksimal ukuran file: {maxFileSizeMB}MB
      </p>
      {files.length > 0 && (
        <div className="mt-4 text-left text-sm">
          <p className="font-medium">File yang dipilih:</p>
          <ul className="mt-1 pl-4">
            {files.map((item, index) => (
              <li key={index}>
                {item.file.name}{' '}
                {item.isZip && (
                  <span className="text-xs text-muted-foreground">
                    (ZIP - {item.extractedFiles?.length ?? 0} file diekstrak)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
