/**
 * Client-side image compression and conversion utility.
 * Converts and resizes images to optimized WebP (or JPEG fallback)
 * directly in the user's browser before sending to the server.
 * Supports files up to 50MB+ by resizing & re-encoding on HTML5 Canvas.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  mimeType?: "image/webp" | "image/jpeg";
}

export interface CompressionResult {
  file: File;
  dataUrl: string;
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
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.78,
    mimeType = "image/webp",
  } = options;

  // If already SVG or GIF (animated), don't compress via canvas to avoid losing animation/vector
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      file,
      dataUrl,
      originalSize: file.size,
      compressedSize: file.size,
      savingsPercentage: 0,
      width: 0,
      height: 0,
    };
  }

  return new Promise(async (resolve) => {
    let objectUrl = "";
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      // Fallback if createObjectURL fails
      const fallbackUrl = await readFileAsDataUrl(file);
      resolve({
        file,
        dataUrl: fallbackUrl,
        originalSize: file.size,
        compressedSize: file.size,
        savingsPercentage: 0,
        width: 0,
        height: 0,
      });
      return;
    }

    const img = new Image();

    img.onload = () => {
      try {
        URL.revokeObjectURL(objectUrl);

        let targetWidth = img.naturalWidth || img.width || 800;
        let targetHeight = img.naturalHeight || img.height || 600;

        // Proportional resize if larger than maximum bounds
        if (targetWidth > maxWidth || targetHeight > maxHeight) {
          const ratio = Math.min(maxWidth / targetWidth, maxHeight / targetHeight);
          targetWidth = Math.max(1, Math.round(targetWidth * ratio));
          targetHeight = Math.max(1, Math.round(targetHeight * ratio));
        }

        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Fallback if canvas context unavailable
          readFileAsDataUrl(file).then((fallbackUrl) => {
            resolve({
              file,
              dataUrl: fallbackUrl,
              originalSize: file.size,
              compressedSize: file.size,
              savingsPercentage: 0,
              width: targetWidth,
              height: targetHeight,
            });
          });
          return;
        }

        // High quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        // Target output
        let targetMime = mimeType;
        let dataUrl = canvas.toDataURL(targetMime, quality);

        // Fallback to jpeg if browser doesn't support toDataURL with webp
        if (!dataUrl.startsWith("data:image/webp") && targetMime === "image/webp") {
          targetMime = "image/jpeg";
          dataUrl = canvas.toDataURL("image/jpeg", quality);
        }

        const baseName = file.name.replace(/\.[^/.]+$/, "");
        const outputExt = targetMime === "image/webp" ? ".webp" : ".jpg";
        const outputFileName = `${baseName}${outputExt}`;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve({
                file,
                dataUrl,
                originalSize: file.size,
                compressedSize: Math.round(dataUrl.length * 0.75),
                savingsPercentage: Math.max(
                  0,
                  Math.round(((file.size - dataUrl.length * 0.75) / file.size) * 100)
                ),
                width: targetWidth,
                height: targetHeight,
              });
              return;
            }

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
              dataUrl,
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
      } catch {
        // Fallback on canvas error
        readFileAsDataUrl(file).then((fallbackUrl) => {
          resolve({
            file,
            dataUrl: fallbackUrl,
            originalSize: file.size,
            compressedSize: file.size,
            savingsPercentage: 0,
            width: 0,
            height: 0,
          });
        });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback: read directly as data URL so it never blocks user
      readFileAsDataUrl(file).then((fallbackUrl) => {
        resolve({
          file,
          dataUrl: fallbackUrl,
          originalSize: file.size,
          compressedSize: file.size,
          savingsPercentage: 0,
          width: 0,
          height: 0,
        });
      });
    };

    img.src = objectUrl;
  });
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
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
