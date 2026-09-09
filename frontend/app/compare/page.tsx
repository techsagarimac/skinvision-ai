import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/LoadingState";
import { CompareClient } from "./CompareClient";

export const metadata: Metadata = {
  title: "Compare",
};

export default function ComparePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Suspense fallback={<LoadingState label="Loading comparison…" />}>
        <CompareClient />
      </Suspense>
    </div>
  );
}
