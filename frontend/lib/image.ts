const MAX_EDGE = 1280;
const JPEG_QUALITY = 0.86;

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "That file type is not supported. Please choose a JPEG, PNG, or WebP image.";
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return "That image is too large. Please use a file under 8 MB.";
  }
  return null;
}

export async function resizeImageForUpload(source: Blob): Promise<Blob> {
  const bitmap = await createImageBitmap(source);
  const longest = Math.max(bitmap.width, bitmap.height);
  const scale = longest > MAX_EDGE ? MAX_EDGE / longest : 1;
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return source;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });
  return blob ?? source;
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not capture that frame."));
    }, "image/jpeg", JPEG_QUALITY);
  });
}
