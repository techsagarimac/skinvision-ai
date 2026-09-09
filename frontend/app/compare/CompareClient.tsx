"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CompareView } from "@/components/CompareView";
import { ErrorState } from "@/components/ErrorState";
import { LoadingState } from "@/components/LoadingState";
import { getHistoryItem } from "@/lib/api";
import type { HistoryRecord } from "@/types/analysis";

export function CompareClient() {
  const params = useSearchParams();
  const leftId = Number(params.get("left"));
  const rightId = Number(params.get("right"));
  const [records, setRecords] = useState<HistoryRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!leftId || !rightId) {
      setError("Select two saved analyses from History to compare them.");
      return;
    }
    Promise.all([getHistoryItem(leftId), getHistoryItem(rightId)])
      .then((items) => setRecords(items))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Those analyses could not be loaded.");
      });
  }, [leftId, rightId]);

  if (error) {
    return <ErrorState message={error} />;
  }
  if (!records) {
    return <LoadingState label="Loading comparison…" />;
  }

  const ordered = [...records].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return <CompareView earlier={ordered[0]} later={ordered[1]} />;
}
