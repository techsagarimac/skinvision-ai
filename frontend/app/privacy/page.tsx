import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="eyebrow">Privacy</p>
      <h1 className="mt-3 font-display text-4xl font-semibold">How SkinVision AI handles images</h1>
      <div className="mt-8 space-y-6 text-sm leading-relaxed text-muted">
        <p>
          SkinVision AI performs a visual analysis of a photo or webcam frame that you choose to submit. The
          purpose is limited to estimating visible spots and generating general skincare notes.
        </p>
        <ul className="space-y-3">
          <li>Images are analyzed for the requested purpose.</li>
          <li>Images are not saved permanently by default.</li>
          <li>Face recognition is not performed.</li>
          <li>Identity is not inferred.</li>
          <li>You can choose whether to save analysis statistics such as spot counts and region totals.</li>
          <li>The application is designed to avoid sending images to external services unless you explicitly configure that.</li>
        </ul>
        <p>
          Saved history contains timestamps and numeric estimates only. You can delete those records at any
          time from the <Link href="/history" className="text-accent underline-offset-2 hover:underline">History</Link> page.
        </p>
        <p>
          This product is not a medical device and does not diagnose acne, infection, cancer, or any other
          condition.
        </p>
      </div>
    </div>
  );
}
