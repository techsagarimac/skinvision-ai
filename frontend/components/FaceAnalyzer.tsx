"use client";

import { BookmarkPlus, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { AnalysisOverlay } from "@/components/AnalysisOverlay";
import { AnalysisSummary } from "@/components/AnalysisSummary";
import { DarkCircleCard } from "@/components/DarkCircleCard";
import { CameraCapture } from "@/components/CameraCapture";
import { ErrorState } from "@/components/ErrorState";
import { GuidanceCard } from "@/components/GuidanceCard";
import { ImageUploader } from "@/components/ImageUploader";
import { LoadingState } from "@/components/LoadingState";
import { PrivacyNotice } from "@/components/PrivacyNotice";
import { RegionBreakdown } from "@/components/RegionBreakdown";
import { VoiceGuide } from "@/components/VoiceGuide";
import { ApiRequestError, analyzeImage, saveHistory } from "@/lib/api";
import { resizeImageForUpload } from "@/lib/image";
import type { AnalysisResult } from "@/types/analysis";

type SourceMode = "upload" | "camera";

export function FaceAnalyzer() {
  const [source, setSource] = useState<SourceMode>("camera");
  const [image, setImage] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ message: string; details?: string[] } | null>(null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
    setSavedId(null);
  }

  function handleReady(blob: Blob, url: string) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setImage(blob);
    setPreviewUrl(url);
    setResult(null);
    setError(null);
    setSavedId(null);
  }

  async function runAnalysis() {
    if (!image) return;
    setBusy(true);
    setError(null);
    try {
      const payload = await resizeImageForUpload(image);
      const analysis = await analyzeImage(payload);
      setResult(analysis);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError({ message: err.message, details: err.details });
      } else {
        setError({ message: "The analysis could not be completed. Please try again." });
      }
    } finally {
      setBusy(false);
    }
  }

  async function persist() {
    if (!result) return;
    setSaving(true);
    setError(null);
    try {
      const record = await saveHistory({
        visible_spot_count: result.total_visible_spots,
        region_data: result.regions,
        image_quality: result.image_quality,
        detection_mode: result.detection_mode,
        dark_circle_data: {
          detected: result.dark_circles.detected,
          level: result.dark_circles.level,
          left_score: result.dark_circles.left.darkness_score,
          right_score: result.dark_circles.right.darkness_score,
        },
      });
      setSavedId(record.id);
    } catch (err) {
      setError({
        message: err instanceof Error ? err.message : "Those statistics could not be saved.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
      <section className="glass-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Input</p>
            <h1 className="mt-2 font-display text-2xl font-semibold">Capture or upload</h1>
          </div>
          <div className="flex rounded-full border border-line/10 p-1" role="tablist" aria-label="Image source">
            <button
              type="button"
              role="tab"
              aria-selected={source === "camera"}
              className={`rounded-full px-3 py-1.5 text-sm ${source === "camera" ? "bg-line/10" : "text-muted"}`}
              onClick={() => setSource("camera")}
            >
              Camera
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={source === "upload"}
              className={`rounded-full px-3 py-1.5 text-sm ${source === "upload" ? "bg-line/10" : "text-muted"}`}
              onClick={() => setSource("upload")}
            >
              Upload
            </button>
          </div>
        </div>

        <div className="mt-6">
          {previewUrl ? (
            <div className="space-y-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt="Selected face photo ready for analysis" className="w-full rounded-[1.4rem] object-cover" />
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn-primary" onClick={() => void runAnalysis()} disabled={busy}>
                  Analyze
                </button>
                <button type="button" className="btn-secondary" onClick={reset}>
                  <RotateCcw className="h-4 w-4" />
                  Retake
                </button>
              </div>
            </div>
          ) : source === "camera" ? (
            <CameraCapture onCapture={handleReady} />
          ) : (
            <ImageUploader onReady={handleReady} />
          )}
        </div>
      </section>

      <aside className="space-y-6">
        <section className="glass-panel p-5 sm:p-6">
          <p className="eyebrow">Analysis</p>
          <h2 className="mt-2 font-display text-2xl font-semibold">Visual report</h2>
          <p className="mt-2 text-sm text-muted">
            Results describe estimated visible spots and under-eye darkness. They are not a medical diagnosis.
          </p>
          <div className="mt-5">
            {busy ? <LoadingState label="Running visual analysis…" /> : null}
            {error ? <ErrorState message={error.message} details={error.details} onRetry={result ? undefined : () => void runAnalysis()} /> : null}
            {!busy && !result && !error ? (
              <p className="text-sm text-muted">Capture or upload a photo, then press Analyze.</p>
            ) : null}
          </div>
        </section>

        {result && previewUrl ? (
          <>
            <AnalysisSummary result={result} />
            <AnalysisOverlay imageUrl={previewUrl} result={result} />
            {result.image_quality_report.instructions.length > 0 ? (
              <section className="rounded-2xl border border-line/10 bg-panel/60 p-4 text-sm text-muted">
                <p className="font-medium text-ink">Image notes</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {result.image_quality_report.instructions.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            <DarkCircleCard report={result.dark_circles} />
            <RegionBreakdown regions={result.regions} total={result.total_visible_spots} />
            <GuidanceCard items={result.guidance} />
            <section className="glass-panel space-y-4 p-6">
              <VoiceGuide result={result} />
              <button type="button" className="btn-secondary" onClick={() => void persist()} disabled={saving || savedId !== null}>
                <BookmarkPlus className="h-4 w-4" />
                {savedId ? "Statistics saved" : "Save statistics"}
              </button>
              <PrivacyNotice compact />
            </section>
          </>
        ) : null}
      </aside>
    </div>
  );
}
