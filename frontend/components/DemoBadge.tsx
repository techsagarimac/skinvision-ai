interface DemoBadgeProps {
  mode?: "demo" | "yolo";
}

export function DemoBadge({ mode = "demo" }: DemoBadgeProps) {
  if (mode === "yolo") {
    return (
      <span className="inline-flex items-center rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
        YOLO detection
      </span>
    );
  }

  return (
    <span className="inline-flex items-center rounded-full border border-line/15 bg-line/5 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-muted">
      Demo AI Detection
    </span>
  );
}
