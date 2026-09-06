/**
 * Client-side image compression and conversion utility.
 * Converts and resizes images to optimized WebP (or JPEG fallback)
 * directly in the user's browser before sending to the server.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/webp" | "image/jpeg";
}

export interface CompressionResult {
  file: File;
  originalSize: number;
  compressedSize: number;
  savingsPercentage: number;
  width: number;
  height: number;
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.82,
    mimeType = "image/webp",
  } = options;

  // If already SVG or GIF (animated), don't compress via canvas to avoid losing animation/vector
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return {
      file,
      originalSize: file.size,
      compressedSize: file.size,
      savingsPercentage: 0,
      width: 0,
      height: 0,
    };
  }

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let targetWidth = img.naturalWidth || img.width;
      let targetHeight = img.naturalHeight || img.height;

      // Proportional resize if larger than bounds
      if (targetWidth > maxWidth || targetHeight > maxHeight) {
        const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
        targetWidth = Math.round(targetWidth * ratio);
        targetHeight = Math.round(targetHeight * ratio);
      }

      // Create canvas
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        // Fallback: return original file if canvas context unavailable
        resolve({
          file,
          originalSize: file.size,
          compressedSize: file.size,
          savingsPercentage: 0,
          width: targetWidth,
          height: targetHeight,
        });
        return;
      }

      // Smooth rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // Determine output extension and mime
      const targetMime = mimeType;
      const baseName = file.name.replace(/\.[^/.]+$/, "");
      const outputExt = targetMime === "image/webp" ? ".webp" : ".jpg";
      const outputFileName = `${baseName}${outputExt}`;

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback if conversion failed
            resolve({
              file,
              originalSize: file.size,
              compressedSize: file.size,
              savingsPercentage: 0,
              width: targetWidth,
              height: targetHeight,
            });
            return;
          }

          // If converted blob is surprisingly larger than original (rare, e.g. already heavily compressed tiny file)
          // we can still choose the smaller one or use the webp
          const compressedFile = new File([blob], outputFileName, {
            type: targetMime,
            lastModified: Date.now(),
          });

          const savings = Math.max(
            0,
            Math.round(((file.size - compressedFile.size) / file.size) * 100)
          );

          resolve({
            file: compressedFile,
            originalSize: file.size,
            compressedSize: compressedFile.size,
            savingsPercentage: savings,
            width: targetWidth,
            height: targetHeight,
          });
        },
        targetMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Gagal memuat file gambar "${file.name}" untuk diproses.`));
    };

    img.src = objectUrl;
  });
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
