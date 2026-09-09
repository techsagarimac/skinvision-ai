import {
  Aperture,
  Eye,
  Lock,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import Link from "next/link";
import { FeatureCard } from "@/components/FeatureCard";
import { Hero } from "@/components/Hero";
import { PrivacyNotice } from "@/components/PrivacyNotice";

export default function HomePage() {
  return (
    <>
      <Hero />

      <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 max-w-xl font-display text-3xl font-semibold">A clear visual workflow</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-4">
          {[
            { step: "01", title: "Capture", text: "Upload a photo or take a webcam frame." },
            { step: "02", title: "Position", text: "Keep your face centered in good light." },
            { step: "03", title: "Analyze", text: "Computer vision estimates visible spots and under-eye darkness." },
            { step: "04", title: "Review", text: "See a region map and general guidance." },
          ].map((item) => (
            <article key={item.step} className="glass-panel p-5">
              <p className="text-xs text-accent">{item.step}</p>
              <h3 className="mt-2 font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <p className="eyebrow">AI analysis features</p>
        <h2 className="mt-3 font-display text-3xl font-semibold">Built for a careful visual review</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            icon={ScanSearch}
            title="Visible spot mapping"
            description="Estimated detections are placed on approximate facial regions such as forehead, cheeks, nose, and chin."
          />
          <FeatureCard
            icon={Eye}
            title="Under-eye darkness"
            description="Left and right under-eye areas are compared with nearby skin to estimate visible darkness in the photo."
          />
          <FeatureCard
            icon={Aperture}
            title="Image quality notes"
            description="Brightness, blur, and face framing are checked so you can recapture if the photo is too dark or soft."
          />
          <FeatureCard
            icon={Sparkles}
            title="General guidance"
            description="Conservative, non-medical notes only. No prescriptions and no diagnosis of acne or disease."
          />
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-2">
        <PrivacyNotice />
        <article className="glass-panel p-6">
          <p className="eyebrow">Technology</p>
          <h3 className="mt-2 font-display text-xl font-semibold">Computer vision, not identity</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex gap-2">
              <Workflow className="mt-0.5 h-4 w-4 text-accent" aria-hidden />
              MediaPipe / OpenCV facial landmarks for region estimates
            </li>
            <li className="flex gap-2">
              <ScanSearch className="mt-0.5 h-4 w-4 text-accent" aria-hidden />
              YOLO-ready detector with Demo AI Detection when no model is present
            </li>
            <li className="flex gap-2">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-accent" aria-hidden />
              Optional saved statistics without storing the original face image
            </li>
            <li className="flex gap-2">
              <Lock className="mt-0.5 h-4 w-4 text-accent" aria-hidden />
              Local-first architecture. No face recognition and no identity inference
            </li>
          </ul>
        </article>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="glass-panel flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
          <div>
            <p className="eyebrow">Get started</p>
            <h2 className="mt-2 font-display text-3xl font-semibold">Understand your skin through AI vision</h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Run a visual analysis in minutes. The demo works immediately without a trained YOLO model.
            </p>
          </div>
          <Link href="/analyze" className="btn-primary">
            Analyze My Skin
          </Link>
        </div>
      </section>
    </>
  );
}
