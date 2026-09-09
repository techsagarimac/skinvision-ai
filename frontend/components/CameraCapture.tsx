"use client";

import { Camera, RefreshCcw, Square, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { canvasToBlob } from "@/lib/image";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";

interface CameraCaptureProps {
  onCapture: (blob: Blob, previewUrl: string) => void;
}

export function CameraCapture({ onCapture }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [ready, setReady] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => stopCamera();
  }, []);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setReady(false);
  }

  async function startCamera() {
    setError(null);
    setStarting(true);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setError("Camera capture is not available in this browser.");
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setReady(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setError("Camera permission was denied. Enable camera access in your browser settings, then try again.");
      } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
        setError("No camera was found on this device.");
      } else {
        setError("The camera could not be started. Check that it is not in use by another app.");
      }
    } finally {
      setStarting(false);
    }
  }

  async function captureFrame() {
    const video = videoRef.current;
    if (!video || !ready) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas);
    const previewUrl = URL.createObjectURL(blob);
    stopCamera();
    onCapture(blob, previewUrl);
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-[1.6rem] border border-line/10 bg-ink/90 aspect-[4/5] sm:aspect-[4/3]">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          style={{ transform: "scaleX(-1)" }}
          playsInline
          muted
          aria-label="Live camera preview"
        />
        {!ready ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ink/40 text-center text-canvas">
            <Video className="h-7 w-7 opacity-80" />
            <p className="text-sm">Start the camera when you are ready.</p>
          </div>
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[72%] w-[62%] rounded-[46%] border border-white/40" />
          </div>
        )}
      </div>

      <ol className="grid gap-2 text-sm text-muted sm:grid-cols-2">
        <li>Face the camera</li>
        <li>Use good lighting</li>
        <li>Keep your face centered</li>
        <li>Remove heavy obstruction where possible</li>
      </ol>

      {starting ? <LoadingState label="Starting camera…" /> : null}
      {error ? <ErrorState message={error} onRetry={startCamera} /> : null}

      <div className="flex flex-wrap gap-2">
        {!ready ? (
          <button type="button" className="btn-primary" onClick={startCamera} disabled={starting}>
            <Camera className="h-4 w-4" />
            Start camera
          </button>
        ) : (
          <>
            <button type="button" className="btn-primary" onClick={() => void captureFrame()}>
              <Camera className="h-4 w-4" />
              Capture
            </button>
            <button type="button" className="btn-secondary" onClick={stopCamera}>
              <Square className="h-4 w-4" />
              Stop camera
            </button>
          </>
        )}
        <button type="button" className="btn-ghost" onClick={startCamera}>
          <RefreshCcw className="h-4 w-4" />
          Restart
        </button>
      </div>
    </div>
  );
}
