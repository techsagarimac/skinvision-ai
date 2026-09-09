"use client";

import { qualityLabel } from "@/lib/format";
import { REGION_LABELS, REGION_ORDER, type HistoryRecord } from "@/types/analysis";

export function CompareView({ earlier, later }: { earlier: HistoryRecord; later: HistoryRecord }) {
  const delta = later.visible_spot_count - earlier.visible_spot_count;
  const changeLabel =
    delta === 0 ? "No change in detected visible spots" : `${delta > 0 ? "+" : ""}${delta} detection change`;

  return (
    <div className="space-y-6">
      <div className="glass-panel p-6">
        <p className="eyebrow">Visual comparison</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Earlier analysis vs later analysis</h1>
        <p className="mt-3 text-sm text-muted">
          This is a detection change between two saved estimates. It is not a conclusion about skin improvement
          or medical progress.
        </p>
        <p className="mt-4 text-lg font-medium">{changeLabel}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CompareCard title="Earlier analysis" record={earlier} />
        <CompareCard title="Later analysis" record={later} />
      </div>

      <section className="glass-panel p-6">
        <h2 className="font-display text-xl font-semibold">Region detection change</h2>
        <ul className="mt-4 space-y-2 text-sm">
          {REGION_ORDER.map((region) => {
            const diff = later.region_data[region] - earlier.region_data[region];
            return (
              <li key={region} className="flex items-center justify-between border-b border-line/10 py-2">
                <span>{REGION_LABELS[region]}</span>
                <span className="tabular-nums text-muted">
                  {earlier.region_data[region]} → {later.region_data[region]} ({diff > 0 ? `+${diff}` : `${diff}`})
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs text-muted">
          Image quality: {qualityLabel(earlier.image_quality)} vs {qualityLabel(later.image_quality)}. Lighting
          and camera angle can change detections.
        </p>
        {earlier.dark_circle_data || later.dark_circle_data ? (
          <p className="mt-2 text-xs text-muted">
            Under-eye darkness: {earlier.dark_circle_data?.level ?? "none"} → {later.dark_circle_data?.level ?? "none"}.
            This is a detection change, not a medical conclusion.
          </p>
        ) : null}
      </section>
    </div>
  );
}

function CompareCard({ title, record }: { title: string; record: HistoryRecord }) {
  return (
    <article className="glass-panel p-5">
      <p className="eyebrow">{title}</p>
      <p className="mt-3 font-display text-3xl font-semibold">{record.visible_spot_count}</p>
      <p className="text-sm text-muted">visible spots detected</p>
      <p className="mt-3 text-xs text-muted">Quality {qualityLabel(record.image_quality)}</p>
      {record.dark_circle_data ? (
        <p className="mt-1 text-xs text-muted">
          Under-eye {record.dark_circle_data.detected ? record.dark_circle_data.level : "not highlighted"}
        </p>
      ) : null}
    </article>
  );
}
