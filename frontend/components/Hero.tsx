import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FaceScanVisual } from "@/components/FaceScanVisual";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:pt-20">
      <div className="animate-rise">
        <p className="eyebrow">SkinVision AI</p>
        <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
          AI-powered visual skin analysis
        </h1>
        <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
          Analyze visible skin spots and under-eye darkness using computer vision, then receive clear, general skincare guidance.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/analyze" className="btn-primary">
            Analyze My Skin
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a href="#how-it-works" className="btn-secondary">
            How It Works
          </a>
        </div>
        <p className="mt-6 max-w-md text-xs leading-relaxed text-muted">
          This is an estimated visual analysis of visible spots and under-eye darkness. It is not a diagnosis
          of acne, fatigue, or any other medical condition.
        </p>
      </div>
      <div className="animate-rise [animation-delay:120ms]">
        <FaceScanVisual />
      </div>
    </section>
  );
}
