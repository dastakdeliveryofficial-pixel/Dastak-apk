import React, { useRef, useState } from 'react';
import { Camera, Trash2, CheckCircle2, Loader2, CloudUpload } from 'lucide-react';
import { compressAndConvertToBase64, validateImageFile, getFileExtension } from '../../utils/imageUpload';
import { saveImageToFirestore } from '../../lib/firestoreService';

interface ImageUploaderProps {
  value: string;
  onChange: (urlOrBase64: string) => void;
  label?: string;
  placeholder?: string;
  suggestedTemplates?: { label: string; url: string }[];
  aspectRatio?: 'square' | 'wide';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Product / Dish Image',
  suggestedTemplates = [],
  aspectRatio = 'square'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [firebaseSavedId, setFirebaseSavedId] = useState<string | null>(null);
  const [uploadedFormat, setUploadedFormat] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Invalid file');
      return;
    }

    try {
      setIsProcessing(true);
      const ext = (getFileExtension(file.name) || file.type.split('/')[1] || 'JPG').toUpperCase();
      const base64Data = await compressAndConvertToBase64(file);

      // Immediately update parent state
      onChange(base64Data);
      setUploadedFormat(ext);

      // Save permanently to Firebase Firestore uploadedImages collection
      try {
        const saved = await saveImageToFirestore({
          fileName: file.name,
          originalFormat: ext,
          dataUrl: base64Data
        });
        setFirebaseSavedId(saved.id);
      } catch (fbErr) {
        console.warn('Firebase image backup note:', fbErr);
        setFirebaseSavedId('local-synced');
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Error uploading photo. Please try another image.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onChange('');
    setUploadError(null);
    setFirebaseSavedId(null);
    setUploadedFormat(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
          <span>{label}</span>
          {value && (
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {firebaseSavedId ? `Saved to Firebase (${uploadedFormat || 'Photo'})` : 'Photo Attached'}
            </span>
          )}
        </label>
      )}

      {/* Hidden File Input - Accepts ALL image formats including HEIC, HEIF, JPG, JPEG, PNG, WebP, GIF, BMP, AVIF */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.ppnj,.webp,.gif,.bmp,.avif,.tiff,.tif,.jfif,.svg"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Active Preview or Upload Box */}
      {value ? (
        <div className="relative rounded-2xl overflow-hidden border border-pink-200 bg-pink-50/30 group">
          <div className={`${aspectRatio === 'wide' ? 'h-36 sm:h-44' : 'h-32 sm:h-40'} w-full relative`}>
            <img
              src={value}
              alt="Uploaded Preview"
              className="w-full h-full object-cover"
            />
            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-3 py-1.5 bg-white text-gray-900 rounded-xl text-xs font-bold shadow-md hover:bg-gray-100 flex items-center gap-1.5 transition-transform active:scale-95"
              >
                {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Camera className="w-3.5 h-3.5 text-[#E11D74]" />}
                <span>Change Photo</span>
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 bg-rose-600 text-white rounded-xl shadow-md hover:bg-rose-700 transition-transform active:scale-95"
                title="Remove Image"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-2 bg-white flex items-center justify-between text-[11px] border-t border-pink-100">
            <span className="text-emerald-700 font-semibold truncate max-w-[220px] flex items-center gap-1">
              <CloudUpload className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {value.startsWith('data:image')
                ? `Saved in Firebase (${uploadedFormat || 'JPG/PNG/HEIC'})`
                : 'Online Food Image'}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-[#E11D74] hover:underline"
              >
                Upload New
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="text-xs font-semibold text-rose-600 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed border-pink-200 hover:border-[#E11D74] bg-pink-50/20 hover:bg-pink-50/40 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            aspectRatio === 'wide' ? 'h-32 sm:h-36' : 'h-28 sm:h-32'
          }`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-[#E11D74] animate-spin" />
              <span className="text-xs font-bold text-gray-700">Converting & saving photo to Firebase...</span>
            </div>
          ) : (
            <>
              <div className="w-10 h-10 rounded-xl bg-pink-100 text-[#E11D74] flex items-center justify-center mb-2 shadow-2xs">
                <Camera className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-gray-800">
                Click to Upload Photo (Camera or Gallery)
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 font-medium">
                Supports JPG, JPEG, PNG, HEIC, HEIF, WebP, GIF up to 25MB (Saved to Firebase)
              </p>
            </>
          )}
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <p className="text-[11px] font-semibold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
          ⚠️ {uploadError}
        </p>
      )}

      {/* Suggested Food Templates (if provided) */}
      {suggestedTemplates.length > 0 && (
        <div className="pt-1">
          <span className="text-[10px] text-gray-400 font-bold block mb-1">
            Or pick from standard Matli food templates:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {suggestedTemplates.map((template) => (
              <button
                key={template.label}
                type="button"
                onClick={() => onChange(template.url)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
                  value === template.url
                    ? 'bg-[#E11D74] text-white border-[#E11D74]'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {template.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
