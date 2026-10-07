/**
 * Utility functions for client-side image compression, multi-format conversion
 * (including JPG, JPEG, PNG, HEIC, HEIF, WebP, GIF, BMP, AVIF, TIFF),
 * and Firebase Firestore persistence in Dastak Delivery.
 */
import heic2any from 'heic2any';

const ALLOWED_IMAGE_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'ppnj', 'heic', 'heif', 'webp',
  'gif', 'bmp', 'svg', 'avif', 'tiff', 'tif', 'jfif',
  'pjpeg', 'pjp', 'ico', 'dng', 'raw'
];

export function getFileExtension(fileName: string): string {
  const parts = (fileName || '').toLowerCase().trim().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export function isHeicOrHeif(file: File): boolean {
  const ext = getFileExtension(file.name);
  const mime = (file.type || '').toLowerCase();
  return (
    ext === 'heic' ||
    ext === 'heif' ||
    mime.includes('heic') ||
    mime.includes('heif')
  );
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const ext = getFileExtension(file.name);
  const mime = (file.type || '').toLowerCase();

  const hasValidMime = mime.startsWith('image/') || mime === '' || mime === 'application/octet-stream';
  const hasValidExt = ALLOWED_IMAGE_EXTENSIONS.includes(ext);

  if (!hasValidMime && !hasValidExt) {
    return {
      valid: false,
      error: 'Please select an image file (JPG, JPEG, PNG, HEIC, HEIF, WebP, GIF, BMP).'
    };
  }

  // 25MB ceiling for raw upload before compression (supports high-res iPhone HEIC & camera photos)
  if (file.size > 25 * 1024 * 1024) {
    return {
      valid: false,
      error: 'Image size exceeds 25MB limit. Please choose a smaller photo.'
    };
  }

  return { valid: true };
}

function readFileAsDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Empty file content'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(blob);
  });
}

function compressDataUrlViaCanvas(
  dataUrl: string,
  maxWidth: number,
  maxHeight: number,
  quality: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width || maxWidth;
      let height = img.height || maxHeight;

      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, width);
      canvas.height = Math.max(1, height);

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }

      // Fill white background for transparent PNGs/WebPs converted to JPEG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      let outQuality = quality;
      let outputDataUrl = canvas.toDataURL('image/jpeg', outQuality);

      // Ensure final Base64 string is well under Firestore's 1MB document limit (< 250KB)
      while (outputDataUrl.length > 240 * 1024 && outQuality > 0.45) {
        outQuality -= 0.1;
        outputDataUrl = canvas.toDataURL('image/jpeg', outQuality);
      }

      resolve(outputDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Browser could not decode image directly'));
    };

    img.src = dataUrl;
  });
}

export async function compressAndConvertToBase64(
  file: File,
  maxWidth = 700,
  maxHeight = 700,
  quality = 0.80
): Promise<string> {
  let workingBlob: Blob = file;

  // Step 1: If HEIC / HEIF format, convert on client using heic2any first
  if (isHeicOrHeif(file)) {
    try {
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.82
      });
      workingBlob = Array.isArray(converted) ? converted[0] : converted;
    } catch (heicErr) {
      console.warn('Client HEIC conversion note, falling back to server converter:', heicErr);
    }
  }

  const rawDataUrl = await readFileAsDataURL(workingBlob);

  // Step 2: Try client-side canvas resize & compression
  try {
    return await compressDataUrlViaCanvas(rawDataUrl, maxWidth, maxHeight, quality);
  } catch (canvasErr) {
    console.warn('Canvas decode fallback, trying server-side sharp converter:', canvasErr);
    // Step 3: Fallback to server-side sharp conversion for HEIC / TIFF / raw formats
    try {
      const response = await fetch('/api/convert-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          base64Data: rawDataUrl,
          maxWidth,
          maxHeight,
          quality: Math.round(quality * 100)
        })
      });
      if (response.ok) {
        const result = await response.json();
        if (result?.dataUrl) {
          return result.dataUrl;
        }
      }
    } catch (serverErr) {
      console.warn('Server image conversion fallback note:', serverErr);
    }

    // Final safety fallback if rawDataUrl is small enough
    if (rawDataUrl.startsWith('data:') && rawDataUrl.length < 750 * 1024) {
      return rawDataUrl;
    }
    throw new Error('Could not process this image file. Please try another JPG, PNG, or HEIC photo.');
  }
}
