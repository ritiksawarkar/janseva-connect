import React, { useState } from 'react';
import { X, ZoomIn, Download, ExternalLink } from 'lucide-react';

export const ImagePreview = ({ src, alt = 'Attachment Preview', className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!src) return null;

  return (
    <>
      <div
        onClick={() => setIsOpen(true)}
        className={`relative group cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-50 ${className}`}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          <ZoomIn className="w-5 h-5 drop-shadow" />
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative max-w-3xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-10 right-0 p-1.5 text-white/80 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={src}
              alt={alt}
              className="max-h-[80vh] w-auto max-w-full rounded-2xl shadow-2xl object-contain border border-white/10"
            />
            <div className="mt-3 flex items-center space-x-3 text-white text-xs">
              <a
                href={src}
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in New Tab</span>
              </a>
              <a
                href={src}
                download
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreview;
