import type { Metadata } from "next";
import { FaceAnalyzer } from "@/components/FaceAnalyzer";

export const metadata: Metadata = {
  title: "Analyze",
};

export default function AnalyzePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <FaceAnalyzer />
    </div>
  );
}
