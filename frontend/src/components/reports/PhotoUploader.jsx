import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

export const PhotoUploader = ({
  onFileSelect,
  selectedFile = null,
  previewUrl = null,
  disabled = false,
  error = null,
  className = '',
}) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [internalPreview, setInternalPreview] = useState(previewUrl);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validate image MIME type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file size must be less than 10MB.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setInternalPreview(objectUrl);
    if (onFileSelect) {
      onFileSelect(file, objectUrl);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setInternalPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileSelect) {
      onFileSelect(null, null);
    }
  };

  const displayPreview = previewUrl || internalPreview;

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-xs font-bold uppercase tracking-wider text-[#252238]">
        Photo Evidence / Image Attachment
      </label>

      {displayPreview ? (
        <div className="relative rounded-2xl overflow-hidden border border-[#E9E5F0] bg-gray-50 h-56 w-full shadow-sm group">
          <img
            src={displayPreview}
            alt="Report evidence preview"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRemove}
              className="p-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg transition-transform active:scale-95 flex items-center gap-1.5 text-xs font-semibold"
            >
              <X className="w-4 h-4" />
              <span>Remove Photo</span>
            </button>
          </div>
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-800 border border-emerald-200 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            <span>Image Attached</span>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            dragActive
              ? 'border-purple-500 bg-purple-50/50'
              : 'border-[#E9E5F0] hover:border-purple-300 bg-white/60 hover:bg-purple-50/20'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 shadow-sm">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[#252238]">
            Click to upload or drag & drop photo
          </p>
          <p className="text-xs text-[#6B687A] mt-0.5">PNG, JPG, or WEBP up to 10MB</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            disabled={disabled}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />
        </div>
      )}

      {error && (
        <p className="text-xs text-rose-600 flex items-center gap-1 mt-1">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};
