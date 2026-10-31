import React, { useState } from "react";
import { UploadCloud, X, CheckCircle, Image as ImageIcon, AlertCircle } from "lucide-react";
import { officerApi } from "../../services/api";

export function EvidenceUploader({
  label = "Upload Evidence Photograph",
  required = false,
  evidenceType = "AFTER",
  value,
  onChange,
  hint = "Supported: JPG, PNG, WEBP (Max: 10MB)"
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [useUrlInput, setUseUrlInput] = useState(false);
  const [directUrl, setDirectUrl] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File exceeds maximum allowed size of 10MB.");
      return;
    }

    // Validate mime type
    const validMimes = ["image/jpeg", "image/png", "image/webp"];
    if (!validMimes.includes(file.type)) {
      setError("Only JPEG, PNG, or WEBP image files are allowed.");
      return;
    }

    setIsUploading(true);
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result;
          const uploadRes = await officerApi.uploadEvidence({
            file_name: file.name,
            mime_type: file.type,
            file_data_base64: base64Data,
            evidence_type: evidenceType
          });

          if (uploadRes.success && uploadRes.data) {
            onChange(uploadRes.data.storage_key);
          } else {
            // Fallback to client-side data URL so preview works even without disk writes
            onChange(base64Data);
          }
        } catch (uploadErr) {
          // Fallback to base64 preview on server error
          onChange(event.target?.result);
        } finally {
          setIsUploading(false);
        }
      };
      reader.onerror = () => {
        setError("Failed to read file.");
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError(err.message || "Upload failed");
      setIsUploading(false);
    }
  };

  const handleDirectUrlApply = () => {
    if (!directUrl.trim()) return;
    onChange(directUrl.trim());
    setDirectUrl("");
    setUseUrlInput(false);
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <button
          type="button"
          onClick={() => setUseUrlInput(!useUrlInput)}
          className="text-[11px] text-blue-600 hover:underline"
        >
          {useUrlInput ? "Use File Upload" : "Or Enter Image URL"}
        </button>
      </div>

      {error && (
        <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-600">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {value ? (
        <div className="relative rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
          <img
            src={value}
            alt="Evidence preview"
            className="w-full h-48 object-cover rounded-xl"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800";
            }}
          />
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
            <a
              href={value}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 bg-white text-slate-800 text-xs font-semibold rounded-lg shadow-sm hover:bg-slate-100 transition"
            >
              View Full
            </a>
            <button
              type="button"
              onClick={handleRemove}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-red-700 transition flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" /> Remove
            </button>
          </div>
          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Attached
          </div>
        </div>
      ) : useUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            placeholder="https://example.com/site-photo.jpg"
            className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleDirectUrlApply}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition"
          >
            Apply
          </button>
        </div>
      ) : (
        <label className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/20 transition rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer text-center block">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Processing & validating image...</p>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-2">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-xs font-semibold text-slate-700">Click to upload or take site photograph</p>
              <p className="text-[11px] text-slate-400 mt-1">{hint}</p>
            </>
          )}
        </label>
      )}
    </div>
  );
}

export default EvidenceUploader;
