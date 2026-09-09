"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { resizeImageForUpload, validateImageFile } from "@/lib/image";
import { ErrorState } from "@/components/ErrorState";

interface ImageUploaderProps {
  onReady: (blob: Blob, previewUrl: string) => void;
}

export function ImageUploader({ onReady }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    const validation = validateImageFile(file);
    if (validation) {
      setError(validation);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const resized = await resizeImageForUpload(file);
      onReady(resized, URL.createObjectURL(resized));
    } catch {
      setError("We could not read that image. Try another photo.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <label
        htmlFor="skin-image"
        className="flex cursor-pointer flex-col items-center justify-center rounded-[1.6rem] border border-dashed border-line/20 bg-panel/40 px-6 py-14 text-center transition hover:border-accent/40"
      >
        <Upload className="h-6 w-6 text-accent" aria-hidden />
        <span className="mt-3 text-sm font-medium">Upload a face photo</span>
        <span className="mt-1 text-xs text-muted">JPEG, PNG, or WebP · under 8 MB</span>
        <input
          id="skin-image"
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="sr-only"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
      </label>
      <button type="button" className="btn-secondary" onClick={() => inputRef.current?.click()} disabled={busy}>
        Choose image
      </button>
      {error ? <ErrorState message={error} /> : null}
    </div>
  );
}
