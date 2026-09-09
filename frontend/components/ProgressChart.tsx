"use client";

import { useMemo, useState } from "react";
import { formatDateTime } from "@/lib/format";
import type { HistoryRecord } from "@/types/analysis";

export function ProgressChart({ items }: { items: HistoryRecord[] }) {
  const [active, setActive] = useState<number | null>(null);

  const points = useMemo(() => {
    if (items.length === 0) return [];
    const max = Math.max(...items.map((item) => item.visible_spot_count), 1);
    return items.map((item, index) => ({
      item,
      x: items.length === 1 ? 50 : (index / (items.length - 1)) * 100,
      y: 100 - (item.visible_spot_count / max) * 82 - 8,
    }));
  }, [items]);

  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");

  if (items.length === 0) {
    return <p className="text-sm text-muted">Save an analysis to start a visual trend.</p>;
  }

  return (
    <div>
      <p className="font-display text-lg font-semibold">Detected Visible Spots Over Time</p>
      <p className="mt-1 text-xs text-muted">
        Changes may reflect lighting, camera angle, image quality, and detection variation.
      </p>
      <svg viewBox="0 0 100 100" className="mt-4 h-48 w-full" role="img" aria-label="Detected visible spots over time">
        <line x1="0" y1="92" x2="100" y2="92" stroke="rgb(var(--line))" strokeOpacity="0.15" strokeWidth="0.4" />
        {path ? (
          <path d={path} fill="none" stroke="rgb(var(--accent))" strokeWidth="1.2" strokeLinejoin="round" />
        ) : null}
        {points.map((point) => (
          <circle
            key={point.item.id}
            cx={point.x}
            cy={point.y}
            r={active === point.item.id ? 2.2 : 1.6}
            fill="rgb(var(--accent))"
            className="cursor-pointer"
            onMouseEnter={() => setActive(point.item.id)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(point.item.id)}
            onBlur={() => setActive(null)}
            tabIndex={0}
          />
        ))}
      </svg>
      {active !== null ? (
        <p className="text-xs text-muted">
          {(() => {
            const match = items.find((item) => item.id === active);
            if (!match) return null;
            return `${formatDateTime(match.created_at)} · ${match.visible_spot_count} visible spots`;
          })()}
        </p>
      ) : (
        <p className="text-xs text-muted">Focus a point to inspect a saved estimate.</p>
      )}
    </div>
  );
}
