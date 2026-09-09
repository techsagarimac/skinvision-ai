"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useVoiceGuide } from "@/hooks/useVoiceGuide";
import { buildAnalysisSpeech } from "@/lib/voice";
import type { AnalysisResult } from "@/types/analysis";

export function VoiceGuide({ result }: { result: AnalysisResult }) {
  const { speak, stop, speaking, supported } = useVoiceGuide();

  if (!supported) {
    return <p className="text-xs text-muted">Voice playback is not available in this browser.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        className="btn-secondary"
        onClick={() => speak(buildAnalysisSpeech(result))}
        disabled={speaking}
      >
        <Volume2 className="h-4 w-4" />
        Speak Results
      </button>
      <button type="button" className="btn-ghost" onClick={stop} disabled={!speaking}>
        <VolumeX className="h-4 w-4" />
        Stop Voice
      </button>
    </div>
  );
}
