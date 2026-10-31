import React, { useRef } from 'react';
import { Upload, X, FileText, Image as ImageIcon, AlertCircle } from 'lucide-react';

export const AttachmentUploader = ({
  files = [],
  onChange,
  maxFiles = 5,
  maxSizeBytes = 5 * 1024 * 1024,
  error = null
}) => {
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const validFiles = [];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

    for (const f of selected) {
      if (!allowedTypes.includes(f.type)) {
        alert(`File "${f.name}" has an unsupported format. Please upload JPG, PNG, WEBP, or PDF.`);
        continue;
      }
      if (f.size > maxSizeBytes) {
        alert(`File "${f.name}" exceeds the 5MB size limit.`);
        continue;
      }
      validFiles.push(f);
    }

    const combined = [...files, ...validFiles].slice(0, maxFiles);
    onChange(combined);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index) => {
    const updated = files.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div
        onClick={() => fileInputRef.current && fileInputRef.current.click()}
        className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/20 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center group"
      >
        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2 group-hover:scale-105 transition">
          <Upload className="w-5 h-5" />
        </div>
        <p className="text-xs md:text-sm font-semibold text-slate-800">
          Upload Evidence / Site Photos
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          JPG, PNG, WEBP, PDF up to 5MB each (Max {maxFiles} attachments)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".jpg,.jpeg,.png,.webp,.pdf"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-xs text-rose-600 flex items-center space-x-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}

      {/* Selected Files Preview */}
      {files.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {files.map((file, idx) => {
            const isImage = file.type.startsWith('image/');
            const previewUrl = isImage ? URL.createObjectURL(file) : null;

            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded-lg border border-slate-100 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{file.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AttachmentUploader;

