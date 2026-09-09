"use client";

import { formatPercent } from "@/lib/format";
import { REGION_LABELS, type Detection } from "@/types/analysis";

interface DetectionMarkerProps {
  detection: Detection;
  index: number;
  selected: boolean;
  onSelect: (index: number) => void;
}

export function DetectionMarker({ detection, index, selected, onSelect }: DetectionMarkerProps) {
  return (
    <button
      type="button"
      className={`absolute rounded-full border transition ${
        selected ? "border-accent bg-accent/30" : "border-accent/80 bg-accent/15 hover:bg-accent/25"
      }`}
      style={{
        left: `${detection.x * 100}%`,
        top: `${detection.y * 100}%`,
        width: `${detection.width * 100}%`,
        height: `${detection.height * 100}%`,
        minWidth: "12px",
        minHeight: "12px",
      }}
      aria-label={`Visible spot in ${REGION_LABELS[detection.region]}, confidence ${formatPercent(detection.confidence)}`}
      aria-pressed={selected}
      onClick={() => onSelect(index)}
    />
  );
}
