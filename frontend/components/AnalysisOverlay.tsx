"use client";

import { useMemo, useState } from "react";
import { DetectionMarker } from "@/components/DetectionMarker";
import { formatPercent } from "@/lib/format";
import {
  REGION_LABELS,
  UNDER_EYE_LABELS,
  type AnalysisResult,
  type Detection,
  type UnderEyeEstimate,
} from "@/types/analysis";

interface AnalysisOverlayProps {
  imageUrl: string;
  result: AnalysisResult;
}

type Selection =
  | { kind: "spot"; index: number }
  | { kind: "under_eye"; side: "left" | "right" }
  | null;

export function AnalysisOverlay({ imageUrl, result }: AnalysisOverlayProps) {
  const [selected, setSelected] = useState<Selection>(null);
  const detection = selected?.kind === "spot" ? result.detections[selected.index] : null;
  const underEye = selected?.kind === "under_eye" ? result.dark_circles[selected.side] : null;

  const regionLabels = useMemo(() => {
    if (!result.face_box) return [];
    const box = result.face_box;
    return [
      { label: "Forehead", x: box.x + box.width * 0.5, y: box.y + box.height * 0.12 },
      { label: "Nose", x: box.x + box.width * 0.5, y: box.y + box.height * 0.48 },
      { label: "Chin", x: box.x + box.width * 0.5, y: box.y + box.height * 0.9 },
    ];
  }, [result.face_box]);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-[1.6rem] border border-line/10 bg-panel">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="Analyzed face with estimated visible spot and under-eye overlay" className="block w-full" />
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          aria-hidden
        >
          {result.face_box ? (
            <rect
              x={result.face_box.x}
              y={result.face_box.y}
              width={result.face_box.width}
              height={result.face_box.height}
              fill="none"
              stroke="rgb(var(--accent))"
              strokeOpacity="0.7"
              strokeWidth="0.006"
              rx="0.04"
            />
          ) : null}
          {result.landmarks.map((point, index) => (
            <circle key={`${point.x}-${point.y}-${index}`} cx={point.x} cy={point.y} r="0.004" fill="rgb(var(--accent))" opacity="0.55" />
          ))}
          {regionLabels.map((item) => (
            <text
              key={item.label}
              x={item.x}
              y={item.y}
              fill="rgb(var(--ink))"
              fontSize="0.028"
              textAnchor="middle"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {item.label}
            </text>
          ))}
        </svg>
        <UnderEyeMarker
          estimate={result.dark_circles.left}
          selected={selected?.kind === "under_eye" && selected.side === "left"}
          onSelect={() => setSelected({ kind: "under_eye", side: "left" })}
        />
        <UnderEyeMarker
          estimate={result.dark_circles.right}
          selected={selected?.kind === "under_eye" && selected.side === "right"}
          onSelect={() => setSelected({ kind: "under_eye", side: "right" })}
        />
        {result.detections.map((item, index) => (
          <DetectionMarker
            key={`${item.x}-${item.y}-${index}`}
            detection={item}
            index={index}
            selected={selected?.kind === "spot" && selected.index === index}
            onSelect={(next) => setSelected({ kind: "spot", index: next })}
          />
        ))}
      </div>
      {detection ? (
        <SpotDetails detection={detection} />
      ) : underEye ? (
        <UnderEyeDetails estimate={underEye} />
      ) : (
        <p className="text-xs text-muted">Select a marker to inspect a visible spot or under-eye estimate.</p>
      )}
    </div>
  );
}

function UnderEyeMarker({
  estimate,
  selected,
  onSelect,
}: {
  estimate: UnderEyeEstimate;
  selected: boolean;
  onSelect: () => void;
}) {
  const box = estimate.box;
  return (
    <button
      type="button"
      className={`absolute rounded-[45%] border transition ${
        selected
          ? "border-accent2 bg-accent2/25"
          : estimate.visible
            ? "border-accent2/80 bg-accent2/10 hover:bg-accent2/20"
            : "border-line/25 bg-transparent hover:bg-line/10"
      }`}
      style={{
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.width * 100}%`,
        height: `${box.height * 100}%`,
      }}
      aria-label={`${UNDER_EYE_LABELS[estimate.region]}, darkness ${formatPercent(estimate.darkness_score)}`}
      aria-pressed={selected}
      onClick={onSelect}
    />
  );
}

function SpotDetails({ detection }: { detection: Detection }) {
  return (
    <div className="rounded-2xl border border-line/10 bg-panel/70 px-4 py-3 text-sm">
      <p className="font-medium">Visible spot</p>
      <p className="mt-1 text-muted">{REGION_LABELS[detection.region]}</p>
      <p className="text-muted">Confidence {formatPercent(detection.confidence)}</p>
    </div>
  );
}

function UnderEyeDetails({ estimate }: { estimate: UnderEyeEstimate }) {
  return (
    <div className="rounded-2xl border border-line/10 bg-panel/70 px-4 py-3 text-sm">
      <p className="font-medium">Visible under-eye darkness</p>
      <p className="mt-1 text-muted">{UNDER_EYE_LABELS[estimate.region]}</p>
      <p className="text-muted">
        {estimate.visible ? `Estimated darkness ${formatPercent(estimate.darkness_score)}` : "Not highlighted in this photo"}
      </p>
      <p className="text-muted">Confidence {formatPercent(estimate.confidence)}</p>
    </div>
  );
}
