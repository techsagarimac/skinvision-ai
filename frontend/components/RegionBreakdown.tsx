import { REGION_LABELS, REGION_ORDER, type RegionCounts } from "@/types/analysis";

export function RegionBreakdown({ regions, total }: { regions: RegionCounts; total: number }) {
  return (
    <section className="glass-panel p-6">
      <p className="eyebrow">Region map</p>
      <h3 className="mt-2 font-display text-xl font-semibold">Approximate facial regions</h3>
      <p className="mt-1 text-xs text-muted">Regions are estimated from facial landmarks and are not anatomically precise.</p>
      <ul className="mt-5 space-y-3">
        {REGION_ORDER.map((region) => {
          const value = regions[region];
          const width = total > 0 ? Math.max(6, (value / total) * 100) : 6;
          return (
            <li key={region}>
              <div className="flex items-center justify-between text-sm">
                <span>{REGION_LABELS[region]}</span>
                <span className="tabular-nums text-muted">{value}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line/10">
                <div className="h-full rounded-full bg-accent" style={{ width: `${width}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
