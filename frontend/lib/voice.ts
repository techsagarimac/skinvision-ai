import { REGION_LABELS, type AnalysisResult } from "@/types/analysis";

export interface VoiceGuide {
  speak: (text: string) => void;
  stop: () => void;
  supported: boolean;
}

export function createBrowserVoice(): VoiceGuide {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;

  return {
    supported,
    speak(text: string) {
      if (!supported) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.96;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    },
    stop() {
      if (!supported) return;
      window.speechSynthesis.cancel();
    },
  };
}

export function buildAnalysisSpeech(result: AnalysisResult): string {
  const count = result.total_visible_spots;
  const spotWord = count === 1 ? "visible spot" : "visible spots";
  const parts = [`I detected ${count} ${spotWord}.`];

  const notable = Object.entries(result.regions)
    .filter(([, value]) => value > 0)
    .map(([key, value]) => {
      const label = REGION_LABELS[key as keyof typeof REGION_LABELS];
      return `${value} around the ${label.toLowerCase()}`;
    });

  if (notable.length) {
    parts.push(notable.join(", ") + ".");
  }

  parts.push(result.summary.level_label + ".");
  if (result.dark_circles.detected) {
    const sides = [
      result.dark_circles.left.visible ? "left under-eye" : null,
      result.dark_circles.right.visible ? "right under-eye" : null,
    ].filter(Boolean);
    parts.push(`I also estimated visible under-eye darkness around the ${sides.join(" and ")}.`);
    parts.push(result.dark_circles.level_label + ".");
  } else {
    parts.push("I did not highlight clear under-eye darkness in this photo.");
  }
  parts.push("This is a visual analysis, not a medical diagnosis.");
  return parts.join(" ");
}
