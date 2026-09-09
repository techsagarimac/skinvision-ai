"use client";

import { useEffect, useMemo, useState } from "react";
import { createBrowserVoice } from "@/lib/voice";

export function useVoiceGuide() {
  const voice = useMemo(() => createBrowserVoice(), []);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    return () => voice.stop();
  }, [voice]);

  function speak(text: string) {
    if (!voice.supported) return;
    voice.speak(text);
    setSpeaking(true);
    const started = Date.now();
    const timer = window.setInterval(() => {
      if (!window.speechSynthesis.speaking || Date.now() - started > 30000) {
        window.clearInterval(timer);
        setSpeaking(false);
      }
    }, 250);
  }

  function stop() {
    voice.stop();
    setSpeaking(false);
  }

  return { speak, stop, speaking, supported: voice.supported };
}
