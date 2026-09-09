import { DemoBadge } from "@/components/DemoBadge";
import { qualityLabel } from "@/lib/format";
import type { AnalysisResult } from "@/types/analysis";

export function AnalysisSummary({ result }: { result: AnalysisResult }) {
  const count = result.total_visible_spots;

  return (
    <section className="glass-panel p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="eyebrow">AI Skin Analysis</p>
        <DemoBadge mode={result.detection_mode} />
      </div>
      <h2 className="mt-3 font-display text-3xl font-semibold">
        {count} visible {count === 1 ? "spot" : "spots"} detected
      </h2>
      <p className="mt-2 text-sm text-muted">{result.summary.level_label}</p>
      <p className="mt-1 text-sm text-muted">{result.dark_circles.level_label}</p>
      <p className="mt-3 text-xs leading-relaxed text-muted">{result.summary.disclaimer}</p>
      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-2xl bg-line/5 px-3 py-3">
          <dt className="text-muted">Image quality</dt>
          <dd className="mt-1 font-medium">{qualityLabel(result.image_quality)}</dd>
        </div>
        <div className="rounded-2xl bg-line/5 px-3 py-3">
          <dt className="text-muted">Detection mode</dt>
          <dd className="mt-1 font-medium">{result.detection_mode === "demo" ? "Demo" : "YOLO"}</dd>
        </div>
      </dl>
    </section>
  );
}
