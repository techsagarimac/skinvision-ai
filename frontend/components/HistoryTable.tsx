"use client";

import Link from "next/link";
import { Trash2 } from "lucide-react";
import { formatDateTime, qualityLabel } from "@/lib/format";
import { REGION_LABELS, REGION_ORDER, type HistoryRecord } from "@/types/analysis";

function underEyeLabel(item: HistoryRecord): string {
  if (!item.dark_circle_data) return "—";
  if (!item.dark_circle_data.detected) return "Not highlighted";
  return item.dark_circle_data.level.charAt(0).toUpperCase() + item.dark_circle_data.level.slice(1);
}

interface HistoryTableProps {
  items: HistoryRecord[];
  selected: number[];
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
}

export function HistoryTable({ items, selected, onToggle, onDelete }: HistoryTableProps) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">No saved analyses yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <caption className="sr-only">Saved visual analysis statistics</caption>
        <thead className="text-xs uppercase tracking-[0.12em] text-muted">
          <tr>
            <th className="pb-3 pr-3 font-medium">Compare</th>
            <th className="pb-3 pr-3 font-medium">Date</th>
            <th className="pb-3 pr-3 font-medium">Visible spots</th>
            <th className="pb-3 pr-3 font-medium">Regions</th>
            <th className="pb-3 pr-3 font-medium">Under-eye</th>
            <th className="pb-3 pr-3 font-medium">Quality</th>
            <th className="pb-3 font-medium"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-t border-line/10">
              <td className="py-3 pr-3">
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => onToggle(item.id)}
                  aria-label={`Select analysis from ${formatDateTime(item.created_at)}`}
                />
              </td>
              <td className="py-3 pr-3">{formatDateTime(item.created_at)}</td>
              <td className="py-3 pr-3 tabular-nums">{item.visible_spot_count}</td>
              <td className="py-3 pr-3 text-muted">
                {REGION_ORDER.map((region) => `${REGION_LABELS[region]} ${item.region_data[region]}`).join(" · ")}
              </td>
              <td className="py-3 pr-3 text-muted">{underEyeLabel(item)}</td>
              <td className="py-3 pr-3">{qualityLabel(item.image_quality)}</td>
              <td className="py-3">
                <button type="button" className="btn-ghost" onClick={() => onDelete(item.id)} aria-label="Delete saved analysis">
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {selected.length === 2 ? (
        <Link href={`/compare?left=${selected[0]}&right=${selected[1]}`} className="btn-primary mt-4">
          Compare selected
        </Link>
      ) : (
        <p className="mt-3 text-xs text-muted">Select two analyses to open a visual comparison.</p>
      )}
    </div>
  );
}
