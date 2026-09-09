import { formatPercent } from "@/lib/format";
import { UNDER_EYE_LABELS, type DarkCircleReport } from "@/types/analysis";

export function DarkCircleCard({ report }: { report: DarkCircleReport }) {
  const sides = [report.left, report.right];

  return (
    <section className="glass-panel p-6">
      <p className="eyebrow">Under-eye scan</p>
      <h3 className="mt-2 font-display text-xl font-semibold">Visible under-eye darkness</h3>
      <p className="mt-2 text-sm font-medium">{report.level_label}</p>
      <p className="mt-2 text-xs leading-relaxed text-muted">{report.disclaimer}</p>
      <ul className="mt-5 space-y-3">
        {sides.map((side) => {
          const width = Math.max(6, side.darkness_score * 100);
          return (
            <li key={side.region}>
              <div className="flex items-center justify-between text-sm">
                <span>{UNDER_EYE_LABELS[side.region]}</span>
                <span className="tabular-nums text-muted">
                  {side.visible ? formatPercent(side.darkness_score) : "Not highlighted"}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line/10">
                <div className="h-full rounded-full bg-accent2" style={{ width: `${width}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
