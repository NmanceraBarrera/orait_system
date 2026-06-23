'use client';

import { useRef, useState } from 'react';
import { Upload, File, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  disabled?: boolean;
}

const MIME_BY_EXTENSION: Record<string, string[]> = {
  '.pdf': ['application/pdf'],
  '.jpg': ['image/jpeg', 'image/jpg'],
  '.jpeg': ['image/jpeg', 'image/jpg'],
  '.png': ['image/png'],
  '.doc': ['application/msword'],
  '.docx': ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
};

const getValidTypes = (accept: string): string[] => {
  const extensions = accept.split(',').map((ext) => ext.trim().toLowerCase());
  const types = new Set<string>();

  extensions.forEach((ext) => {
    MIME_BY_EXTENSION[ext]?.forEach((type) => types.add(type));
  });

  return Array.from(types);
};

const getAcceptedFormatsLabel = (accept: string): string => {
  const extensions = accept
    .split(',')
    .map((ext) => ext.trim().replace('.', '').toUpperCase())
    .filter(Boolean);

  return extensions.join(', ');
};

export default function FileUpload({
  onFileSelect,
  accept = '.pdf,.jpg,.jpeg,.png',
  label = 'Seleccionar archivo',
  disabled = false,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const validTypes = getValidTypes(accept);
  const acceptedFormatsLabel = getAcceptedFormatsLabel(accept);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('El archivo es demasiado grande. Máximo 10MB');
        e.target.value = '';
        return;
      }

      if (!validTypes.includes(file.type)) {
        alert(`Tipo de archivo no válido. Solo se permiten: ${acceptedFormatsLabel}`);
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <Upload className="h-4 w-4" />
          {selectedFile ? 'Cambiar archivo' : 'Seleccionar archivo'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        {selectedFile && (
          <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-800">
            <File className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            <span className="text-sm text-gray-700 dark:text-gray-300">{selectedFile.name}</span>
            {!disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Formatos aceptados: {acceptedFormatsLabel} (máx. 10MB)
      </p>
    </div>
  );
}
