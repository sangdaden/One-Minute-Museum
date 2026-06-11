/**
 * Client-side image helpers. Downscale a picked photo to a compact JPEG data
 * URI before sending it to the API — keeps upload size and vision token cost low.
 */

const DEFAULT_MAX_DIM = 1024;
const DEFAULT_QUALITY = 0.8;

/** Read a File into an HTMLImageElement. */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không đọc được ảnh."));
    };
    img.src = url;
  });
}

/**
 * Downscale `file` so its longest side is at most `maxDim`, returning a JPEG
 * data URI. Throws if the file is not an image or cannot be processed.
 */
export async function fileToDownscaledDataUrl(
  file: File,
  maxDim = DEFAULT_MAX_DIM,
  quality = DEFAULT_QUALITY,
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Tệp không phải ảnh.");
  }

  const img = await loadImage(file);
  const longest = Math.max(img.width, img.height) || 1;
  const scale = Math.min(1, maxDim / longest);
  const width = Math.round(img.width * scale);
  const height = Math.round(img.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Không xử lý được ảnh.");
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", quality);
}

/** Decode a base64 data URI into a Blob (for uploading to storage). Browser-only. */
export function dataUrlToBlob(dataUrl: string): Blob {
  const [head, base64] = dataUrl.split(",");
  const mime = head.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
