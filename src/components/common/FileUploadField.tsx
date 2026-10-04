import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, Loader2, X, FileText, Image as ImageIcon } from 'lucide-react';
import { uploadService, validateClientFile } from '../../services/uploadService';

interface FileUploadFieldProps {
  label: string;
  category: 'IMAGE' | 'DOCUMENT';
  value: string;
  onChange: (url: string) => void;
  onFileSizeChange?: (sizeStr: string) => void;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label,
  category,
  value,
  onChange,
  onFileSizeChange,
  helperText,
  placeholder,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptMimes = category === 'IMAGE' ? 'image/jpeg,image/png,image/webp' : 'application/pdf';
  const limitLabel = category === 'IMAGE' ? 'JPEG, PNG, WebP (max 5 MB)' : 'PDF (max 10 MB)';

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setUploadSuccess(false);

    const check = validateClientFile(file, category);
    if (!check.isValid) {
      setErrorMessage(check.error || 'Invalid file');
      return;
    }

    try {
      setIsUploading(true);
      let res;
      if (category === 'IMAGE') {
        res = await uploadService.uploadImage(file);
      } else {
        res = await uploadService.uploadReport(file);
      }

      onChange(res.url);
      if (onFileSizeChange) {
        const mb = (res.sizeBytes / (1024 * 1024)).toFixed(1);
        onFileSizeChange(`${mb} MB`);
      }
      setUploadSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Upload failed. Please check file format and try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || isUploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleClear = () => {
    onChange('');
    if (onFileSizeChange) onFileSizeChange('');
    setErrorMessage(null);
    setUploadSuccess(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-stone-700">
          {label} <span className="font-normal text-stone-400">({limitLabel})</span>
        </label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-600 hover:text-rose-700 font-medium inline-flex items-center gap-1 cursor-pointer"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* Upload Dropzone / Button */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled && !isUploading) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-3 sm:p-4 text-center transition-colors ${
          isDragOver
            ? 'border-emerald-500 bg-emerald-50/50'
            : errorMessage
            ? 'border-rose-300 bg-rose-50/30'
            : 'border-stone-300 hover:border-stone-400 bg-stone-50/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptMimes}
          onChange={onFileInputChange}
          disabled={disabled || isUploading}
          className="hidden"
          id={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
        />

        {isUploading ? (
          <div className="flex flex-col items-center justify-center py-2 space-y-2">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <span className="text-xs font-medium text-stone-600">
              Verifying magic bytes & uploading...
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-1.5">
            <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-600">
              {category === 'IMAGE' ? (
                <ImageIcon className="w-4 h-4 text-emerald-700" />
              ) : (
                <FileText className="w-4 h-4 text-amber-700" />
              )}
            </div>
            <div className="text-xs text-stone-600">
              <label
                htmlFor={`upload-${label.replace(/\s+/g, '-').toLowerCase()}`}
                className="font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer underline mr-1"
              >
                Upload from device
              </label>
              <span className="hidden sm:inline">or drag & drop</span>
            </div>
            <p className="text-[11px] text-stone-400">Strict signature verification enforced</p>
          </div>
        )}
      </div>

      {/* Direct URL input fallback */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setUploadSuccess(false);
            setErrorMessage(null);
          }}
          disabled={disabled || isUploading}
          placeholder={placeholder || (category === 'IMAGE' ? 'https://... or uploaded image path' : 'https://... or uploaded document path')}
          className="w-full text-xs font-mono bg-white border border-stone-200 rounded-md py-1.5 px-2.5 text-stone-800 focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
      </div>

      {/* Live Preview or File Indicator */}
      {value && (
        <div className="mt-2 p-2 bg-stone-50 border border-stone-200 rounded-md flex items-center gap-2">
          {category === 'IMAGE' ? (
            <div className="w-12 h-12 rounded bg-stone-200 overflow-hidden flex-shrink-0 border border-stone-300">
              <img
                src={value}
                alt="Upload preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded bg-amber-100 text-amber-800 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-800 truncate">{value}</p>
            {uploadSuccess && (
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Stored & verified on server
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 font-medium bg-rose-50 border border-rose-200 px-2.5 py-1.5 rounded-md">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {helperText && <p className="text-[11px] text-stone-400">{helperText}</p>}
    </div>
  );
};
