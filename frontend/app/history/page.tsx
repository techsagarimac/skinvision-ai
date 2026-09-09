import type { Metadata } from "next";
import { HistoryClient } from "./HistoryClient";

export const metadata: Metadata = {
  title: "History",
};

export default function HistoryPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <HistoryClient />
    </div>
  );
}
